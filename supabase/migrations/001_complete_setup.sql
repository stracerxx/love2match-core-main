-- ============================================================================
-- LOVE2MATCH COMPLETE DATABASE SETUP
-- ============================================================================
-- This consolidated migration includes all necessary tables, functions, 
-- policies, and security configurations for the Love2Match platform.
-- 
-- Run this ONCE on a fresh Supabase project to set up everything.
-- ============================================================================

-- ============================================================================
-- SECTION 1: CORE TABLES
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    display_name text,
    full_name text,
    bio text,
    role text DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
    photos text[] DEFAULT '{}',
    tags text[] DEFAULT '{}',
    demographics jsonb DEFAULT '{}',
    love_balance numeric DEFAULT 100,
    love2_balance numeric DEFAULT 0,
    is_suspended boolean DEFAULT false,
    is_online boolean DEFAULT false,
    membership_tier text DEFAULT 'standard' CHECK (membership_tier IN ('standard', 'plus', 'premium')),
    membership_expires_at timestamptz,
    daily_likes_used integer DEFAULT 0,
    last_like_date date,
    last_active timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Profiles table (alternative/legacy structure)
CREATE TABLE IF NOT EXISTS public.profiles (
    id bigserial PRIMARY KEY,
    auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    full_name text,
    role text DEFAULT 'member',
    love_token_balance numeric DEFAULT 100,
    love2_token_balance numeric DEFAULT 0,
    membership_tier text DEFAULT 'standard',
    membership_expires_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- App configuration
CREATE TABLE IF NOT EXISTS public.app_config (
    key text PRIMARY KEY,
    value text NOT NULL,
    description text,
    updated_at timestamptz DEFAULT now()
);

-- Insert default config values
INSERT INTO public.app_config (key, value, description) VALUES
    ('initial_message_fee', '10', 'LOVE tokens required to send first message'),
    ('daily_faucet_amount', '50', 'LOVE tokens users can claim daily'),
    ('exchange_rate', '1', 'LOVE to LOVE2 exchange rate'),
    ('min_exchange_amount', '100', 'Minimum LOVE tokens for exchange')
ON CONFLICT (key) DO NOTHING;

-- Token transactions
CREATE TABLE IF NOT EXISTS public.token_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('earn', 'spend', 'adjust', 'swap', 'gift', 'purchase', 'referral', 'creator_earnings', 'faucet')),
    token_type text NOT NULL CHECK (token_type IN ('LOVE', 'LOVE2')),
    amount numeric NOT NULL,
    balance_before numeric,
    balance_after numeric,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Swap/Exchange requests
CREATE TABLE IF NOT EXISTS public.swap_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    from_token_type text NOT NULL,
    to_token_type text NOT NULL,
    amount numeric NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('like', 'pass')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, target_user_id)
);

-- ============================================================================
-- SECTION 2: MESSAGING TABLES
-- ============================================================================

-- Threads
CREATE TABLE IF NOT EXISTS public.threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    initial_fee_paid boolean DEFAULT false,
    escrow_amount numeric DEFAULT 0,
    escrow_sender_id uuid REFERENCES auth.users(id),
    last_message_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Thread participants
CREATE TABLE IF NOT EXISTS public.thread_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid REFERENCES public.threads(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now(),
    UNIQUE(thread_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid REFERENCES public.threads(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- SECTION 3: MESSAGING FUNCTIONS (ESCROW SYSTEM)
-- ============================================================================

-- Get or create thread between two users
CREATE OR REPLACE FUNCTION public.get_or_create_thread(other_user_id uuid)
RETURNS uuid AS $$
DECLARE
    v_thread_id uuid;
    v_my_id uuid := auth.uid();
BEGIN
    IF v_my_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Look for existing thread between these two
    SELECT t.id INTO v_thread_id
    FROM public.threads t
    JOIN public.thread_participants p1 ON t.id = p1.thread_id
    JOIN public.thread_participants p2 ON t.id = p2.thread_id
    WHERE p1.user_id = v_my_id AND p2.user_id = other_user_id
    LIMIT 1;

    IF v_thread_id IS NULL THEN
        -- Create new thread
        INSERT INTO public.threads (initial_fee_paid, escrow_amount)
        VALUES (FALSE, 0)
        RETURNING id INTO v_thread_id;

        -- Add participants
        INSERT INTO public.thread_participants (thread_id, user_id)
        VALUES (v_thread_id, v_my_id), (v_thread_id, other_user_id);
    END IF;

    RETURN v_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- List user's threads
CREATE OR REPLACE FUNCTION public.list_threads()
RETURNS TABLE (
    thread_id uuid,
    partner_id uuid,
    partner_email text,
    partner_display_name text,
    last_message_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as thread_id,
        u.id as partner_id,
        u.email::text as partner_email,
        u.display_name::text as partner_display_name,
        t.last_message_at
    FROM public.threads t
    JOIN public.thread_participants tp_me ON t.id = tp_me.thread_id AND tp_me.user_id = auth.uid()
    JOIN public.thread_participants tp_other ON t.id = tp_other.thread_id AND tp_other.user_id != auth.uid()
    JOIN public.users u ON tp_other.user_id = u.id
    ORDER BY t.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- List messages in a thread
CREATE OR REPLACE FUNCTION public.list_messages(p_thread_id uuid)
RETURNS TABLE (
    id uuid,
    thread_id uuid,
    sender_id uuid,
    content text,
    created_at timestamptz
) AS $$
BEGIN
    -- Security check: user must be participant
    IF NOT EXISTS (
        SELECT 1 FROM public.thread_participants tp
        WHERE tp.thread_id = p_thread_id AND tp.user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        m.id,
        m.thread_id,
        m.sender_id,
        m.content,
        m.created_at
    FROM public.messages m
    WHERE m.thread_id = p_thread_id
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send message with escrow logic
CREATE OR REPLACE FUNCTION public.escrow_v13_final(
    p_tid TEXT,
    p_sid TEXT,
    p_content TEXT
) RETURNS UUID AS $$
DECLARE
    v_tid UUID;
    v_sid UUID;
    v_thread RECORD;
    v_fee NUMERIC;
    v_sender_balance NUMERIC;
    v_message_id UUID;
BEGIN
    -- 1. Cast parameters
    BEGIN
        v_tid := p_tid::uuid;
        v_sid := p_sid::uuid;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'ID CAST FAIL: %', SQLERRM;
    END;

    -- 2. Get thread details
    SELECT * INTO v_thread FROM public.threads WHERE id = v_tid;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Thread not found: %', v_tid;
    END IF;

    -- 3. Get balance for sender from users table
    SELECT love_balance INTO v_sender_balance 
    FROM public.users WHERE id = v_sid;

    IF v_sender_balance IS NULL THEN
        RAISE EXCEPTION 'Sender not found for id: %', v_sid;
    END IF;

    -- CASE A: Charge initial fee
    IF NOT COALESCE(v_thread.initial_fee_paid, FALSE) THEN
        SELECT value::numeric INTO v_fee FROM public.app_config WHERE key = 'initial_message_fee';
        v_fee := COALESCE(v_fee, 10);

        IF COALESCE(v_sender_balance, 0) < v_fee THEN
            RAISE EXCEPTION 'Insufficient tokens (Need %) - Current: %', v_fee, v_sender_balance;
        END IF;

        -- Deduct from users table
        UPDATE public.users SET love_balance = love_balance - v_fee WHERE id = v_sid;
        
        -- Also update profiles to keep in sync
        UPDATE public.profiles SET love_token_balance = love_token_balance - v_fee WHERE auth_user_id = v_sid;
        
        INSERT INTO public.token_transactions (user_id, type, token_type, amount, balance_before, balance_after, description)
        VALUES (v_sid, 'spend', 'LOVE', v_fee, v_sender_balance, v_sender_balance - v_fee, 'Initial message escrow');

        UPDATE public.threads SET 
            initial_fee_paid = TRUE, 
            escrow_amount = v_fee, 
            escrow_sender_id = v_sid,
            last_message_at = now()
        WHERE id = v_tid;
        
        -- Refresh thread record
        SELECT * INTO v_thread FROM public.threads WHERE id = v_tid;
    END IF;

    -- CASE B: Release reward if this is a reply
    IF COALESCE(v_thread.escrow_amount, 0) > 0 AND v_thread.escrow_sender_id != v_sid THEN
        -- Add to users table
        UPDATE public.users SET love_balance = love_balance + v_thread.escrow_amount WHERE id = v_sid;
        
        -- Also update profiles
        UPDATE public.profiles SET love_token_balance = love_token_balance + v_thread.escrow_amount WHERE auth_user_id = v_sid;
        
        INSERT INTO public.token_transactions (user_id, type, token_type, amount, balance_before, balance_after, description)
        VALUES (v_sid, 'earn', 'LOVE', v_thread.escrow_amount, v_sender_balance, v_sender_balance + v_thread.escrow_amount, 'Reply reward');

        UPDATE public.threads SET 
            escrow_amount = 0,
            last_message_at = now()
        WHERE id = v_tid;
    END IF;

    -- Update last_message_at
    UPDATE public.threads SET last_message_at = now() WHERE id = v_tid;

    -- Insert the message
    INSERT INTO public.messages (thread_id, sender_id, content)
    VALUES (v_tid, v_sid, p_content)
    RETURNING id INTO v_message_id;

    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 4: ADMIN FUNCTIONS
-- ============================================================================

-- Get all users for admin dashboard
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id uuid,
  auth_user_id uuid,
  email varchar,
  role text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  love_balance numeric,
  love2_balance numeric,
  membership_tier text,
  membership_expires_at timestamptz
) 
SECURITY DEFINER
SET search_path = public, auth
AS $$
#variable_conflict use_column
BEGIN
  -- Strict Admin Check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.auth_user_id,
    au.email::varchar,
    p.role,
    p.full_name,
    p.created_at,
    au.last_sign_in_at,
    COALESCE(p.love_token_balance, 0),
    COALESCE(p.love2_token_balance, 0),
    COALESCE(p.membership_tier, 'standard'),
    p.membership_expires_at
  FROM public.profiles p
  JOIN auth.users au ON p.auth_user_id = au.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get mutual matches
CREATE OR REPLACE FUNCTION public.get_mutual_matches()
RETURNS TABLE (
    id uuid,
    email text,
    display_name text,
    full_name text,
    photos text[],
    bio text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.display_name,
        u.full_name,
        u.photos,
        u.bio
    FROM public.users u
    WHERE u.id IN (
        -- Users who liked me
        SELECT l1.user_id FROM public.likes l1 
        WHERE l1.target_user_id = auth.uid() AND l1.status = 'like'
    )
    AND u.id IN (
        -- Users I liked
        SELECT l2.target_user_id FROM public.likes l2 
        WHERE l2.user_id = auth.uid() AND l2.status = 'like'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment likes counter
CREATE OR REPLACE FUNCTION public.increment_likes(user_id_param uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET daily_likes_used = daily_likes_used + 1,
        last_like_date = CURRENT_DATE
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daily faucet claim
CREATE OR REPLACE FUNCTION public.claim_daily_faucet()
RETURNS jsonb AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_last_claim timestamptz;
    v_amount numeric;
    v_current_balance numeric;
    v_new_balance numeric;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Get faucet amount from config
    SELECT value::numeric INTO v_amount FROM public.app_config WHERE key = 'daily_faucet_amount';
    v_amount := COALESCE(v_amount, 50);

    -- Check last claim time (stored in user metadata or a separate table)
    SELECT love_balance INTO v_current_balance FROM public.users WHERE id = v_user_id;
    
    IF v_current_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Add tokens
    v_new_balance := v_current_balance + v_amount;
    
    UPDATE public.users SET love_balance = v_new_balance WHERE id = v_user_id;
    UPDATE public.profiles SET love_token_balance = v_new_balance WHERE auth_user_id = v_user_id;
    
    -- Record transaction
    INSERT INTO public.token_transactions (user_id, type, token_type, amount, balance_before, balance_after, description)
    VALUES (v_user_id, 'faucet', 'LOVE', v_amount, v_current_balance, v_new_balance, 'Daily faucet claim');

    RETURN jsonb_build_object(
        'success', true, 
        'amount', v_amount, 
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON public.users;
CREATE POLICY "Users are viewable by authenticated users" ON public.users 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage own record" ON public.users;
CREATE POLICY "Users can manage own record" ON public.users 
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Token transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.token_transactions;
CREATE POLICY "Users can view own transactions" ON public.token_transactions 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage transactions" ON public.token_transactions;
CREATE POLICY "Service can manage transactions" ON public.token_transactions 
FOR ALL USING (auth.role() = 'service_role');

-- Swap requests policies
DROP POLICY IF EXISTS "Users can view own swap requests" ON public.swap_requests;
CREATE POLICY "Users can view own swap requests" ON public.swap_requests 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create swap requests" ON public.swap_requests;
CREATE POLICY "Users can create swap requests" ON public.swap_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messaging policies
DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.messages;
CREATE POLICY "Users can view messages in their threads" ON public.messages 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.thread_participants tp 
        WHERE tp.thread_id = messages.thread_id AND tp.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can view their threads" ON public.threads;
CREATE POLICY "Users can view their threads" ON public.threads 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.thread_participants tp 
        WHERE tp.thread_id = threads.id AND tp.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can view their participations" ON public.thread_participants;
CREATE POLICY "Users can view their participations" ON public.thread_participants 
FOR SELECT USING (user_id = auth.uid());

-- App config policies
DROP POLICY IF EXISTS "Config is readable by everyone" ON public.app_config;
CREATE POLICY "Config is readable by everyone" ON public.app_config 
FOR SELECT USING (true);

-- Likes policies
DROP POLICY IF EXISTS "Users can view own likes" ON public.likes;
CREATE POLICY "Users can view own likes" ON public.likes 
FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
CREATE POLICY "Users can create likes" ON public.likes 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own likes" ON public.likes;
CREATE POLICY "Users can update own likes" ON public.likes 
FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 6: SECURITY TRIGGERS
-- ============================================================================

-- Protect role changes
CREATE OR REPLACE FUNCTION public.protect_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.role() != 'service_role' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'You are not authorized to change user roles.';
        END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_role_update ON public.profiles;
CREATE TRIGGER protect_role_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_role_change();

DROP TRIGGER IF EXISTS protect_user_role_update ON public.users;
CREATE TRIGGER protect_user_role_update
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.protect_role_change();

-- ============================================================================
-- SECTION 7: GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Function grants
GRANT EXECUTE ON FUNCTION public.get_or_create_thread(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_threads() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_messages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.escrow_v13_final(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_mutual_matches() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_likes(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_faucet() TO authenticated;

-- ============================================================================
-- SECTION 8: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON public.thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_thread_id ON public.thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target_user_id ON public.likes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);

-- ============================================================================
-- COMPLETE
-- ============================================================================

SELECT 'Love2Match database setup complete!' as result;
