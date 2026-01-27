-- MESSAGING ESCROW SYSTEM (v18 - NATIVE ERRORS)
-- Refactored to return UUID directly and RAISE EXCEPTION on error.
-- Eliminates JSON coercion issues.

-- 0. Clean up existing functions
DROP FUNCTION IF EXISTS public.get_or_create_thread(uuid);
DROP FUNCTION IF EXISTS public.list_threads();
DROP FUNCTION IF EXISTS public.list_messages(uuid);
DROP FUNCTION IF EXISTS public.escrow_v13_final(text, text, text);

-- 1. Robust get_or_create_thread
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

-- 2. list_threads function
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

-- 3. list_messages function
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

-- 4. Unified escrow_v13_final (uses users table)
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
    -- 1. Explicitly cast up front
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

    -- 3. Get balance for sender from users table (Source of Truth)
    SELECT love_balance INTO v_sender_balance 
    FROM public.users WHERE id = v_sid;

    IF v_sender_balance IS NULL THEN
        RAISE EXCEPTION 'Sender (users entry) not found for id: %', v_sid;
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
        
        -- Also update profiles if it exists to keep in sync (Optional but safer)
        UPDATE public.profiles SET love_token_balance = love_token_balance - v_fee WHERE auth_user_id = v_sid;
        
        INSERT INTO public.token_transactions (user_id, type, token_type, amount, balance_before, balance_after, description)
        VALUES (v_sid, 'spend', 'LOVE', v_fee, v_sender_balance, v_sender_balance - v_fee, 'Initial message escrow');

        UPDATE public.threads SET 
            initial_fee_paid = TRUE, 
            escrow_amount = v_fee, 
            escrow_sender_id = v_sid,
            last_message_at = now()
        WHERE id = v_tid;
        
        -- Refresh thread record for Case B check
        SELECT * INTO v_thread FROM public.threads WHERE id = v_tid;
    END IF;

    -- CASE B: Release reward if this is a reply (sender is NOT the one who paid)
    IF COALESCE(v_thread.escrow_amount, 0) > 0 AND v_thread.escrow_sender_id != v_sid THEN
        -- Add to users table
        UPDATE public.users SET love_balance = love_balance + v_thread.escrow_amount WHERE id = v_sid;
        
        -- Also update profiles if it exists to keep in sync
        UPDATE public.profiles SET love_token_balance = love_token_balance + v_thread.escrow_amount WHERE auth_user_id = v_sid;
        
        INSERT INTO public.token_transactions (user_id, type, token_type, amount, balance_before, balance_after, description)
        VALUES (v_sid, 'earn', 'LOVE', v_thread.escrow_amount, v_sender_balance, v_sender_balance + v_thread.escrow_amount, 'Reply reward');

        UPDATE public.threads SET 
            escrow_amount = 0,
            last_message_at = now()
        WHERE id = v_tid;
    END IF;

    -- Update last_message_at even if no escrow logic was triggered
    UPDATE public.threads SET last_message_at = now() WHERE id = v_tid;

    -- PART 3: Actually send the message
    INSERT INTO public.messages (thread_id, sender_id, content)
    VALUES (v_tid, v_sid, p_content)
    RETURNING id INTO v_message_id;

    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_thread(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_threads() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_messages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.escrow_v13_final(text, text, text) TO authenticated;

SELECT 'Messaging Core v18 (Native Errors) applied successfully' as result;
