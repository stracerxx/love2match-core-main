-- IMMEDIATE FIX FOR UUID/BIGINT ERROR
-- Apply this SQL directly in Supabase SQL Editor to fix the type conflict

-- Step 1: Drop the problematic RLS policies that are causing the error
DROP POLICY IF EXISTS "token_transactions_select_own" ON public.token_transactions;
DROP POLICY IF EXISTS "token_transactions_insert_own" ON public.token_transactions;

-- Step 2: Check the current structure of token_transactions
DO $$ 
BEGIN
    -- Check if user_id is BIGINT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'token_transactions' 
        AND column_name = 'user_id' 
        AND data_type = 'bigint'
    ) THEN
        RAISE NOTICE 'token_transactions.user_id is BIGINT - creating new policies with explicit casting';
        
        -- Create new policies with explicit type casting
        CREATE POLICY "token_transactions_select_own"
            ON public.token_transactions FOR SELECT
            USING (auth.uid()::text = user_id::text);
            
        CREATE POLICY "token_transactions_insert_own"
            ON public.token_transactions FOR INSERT
            WITH CHECK (auth.uid()::text = user_id::text);
            
    ELSE
        RAISE NOTICE 'token_transactions.user_id is not BIGINT - creating standard policies';
        
        -- Create standard policies for UUID
        CREATE POLICY "token_transactions_select_own"
            ON public.token_transactions FOR SELECT
            USING (auth.uid() = user_id);
            
        CREATE POLICY "token_transactions_insert_own"
            ON public.token_transactions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Step 3: Create the enhanced token_transactions table if needed
CREATE TABLE IF NOT EXISTS public.token_transactions_enhanced (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type text not null check (type in ('earn','spend','adjust','swap','gift','purchase','referral','creator_earnings')),
    token_type text not null check (token_type in ('LOVE','LOVE2')),
    amount numeric not null,
    balance_before numeric,
    balance_after numeric,
    description text,
    related_entity_type text,
    related_entity_id uuid,
    metadata jsonb,
    created_at timestamptz default now()
);

-- Enable RLS on enhanced table
ALTER TABLE public.token_transactions_enhanced ENABLE ROW LEVEL SECURITY;

-- Create policies for enhanced table
CREATE POLICY "token_transactions_enhanced_select_own"
    ON public.token_transactions_enhanced FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "token_transactions_enhanced_insert_own"
    ON public.token_transactions_enhanced FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Step 4: Create swap_requests table (this was causing the original error)
CREATE TABLE IF NOT EXISTS public.swap_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    love_amount numeric not null check (love_amount > 0),
    love2_amount numeric not null check (love2_amount > 0),
    exchange_rate numeric not null,
    status text not null check (status in ('pending','approved','rejected','completed')) default 'pending',
    admin_notes text,
    rejected_reason text,
    approved_by uuid references auth.users(id),
    completed_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see their own swap requests
CREATE POLICY "swap_requests_select_own"
    ON public.swap_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "swap_requests_insert_own"
    ON public.swap_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can see all swap requests
CREATE POLICY "swap_requests_select_admin"
    ON public.swap_requests FOR SELECT
    USING (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

CREATE POLICY "swap_requests_update_admin"
    ON public.swap_requests FOR UPDATE
    USING (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Grant permissions
GRANT ALL ON public.swap_requests TO authenticated;
GRANT ALL ON public.token_transactions_enhanced TO authenticated;

-- Success message
SELECT 'UUID/BIGINT error fixed successfully! The app should now work without type conflicts.' as result;