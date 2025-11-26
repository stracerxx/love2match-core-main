-- Fix UUID/BIGINT Conflict Migration
-- This migration specifically addresses the type mismatch between existing BIGINT user_ids and expected UUID references

-- First, check if we need to handle existing token_transactions table
DO $$ 
BEGIN
    -- Check if token_transactions exists and has BIGINT user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'token_transactions'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'token_transactions' 
        AND column_name = 'user_id' 
        AND data_type = 'bigint'
    ) THEN
        -- Create a temporary table to preserve existing data
        CREATE TABLE IF NOT EXISTS public.token_transactions_temp (
            id uuid,
            user_id bigint,
            type text,
            token_type text,
            amount numeric,
            balance_before numeric,
            balance_after numeric,
            description text,
            related_entity_type text,
            related_entity_id uuid,
            created_at timestamptz
        );
        
        -- Copy existing data to temp table
        INSERT INTO public.token_transactions_temp 
        SELECT * FROM public.token_transactions;
        
        -- Drop the old table
        DROP TABLE public.token_transactions;
        
        -- Create the new table with proper UUID references
        CREATE TABLE public.token_transactions (
            id uuid primary key default gen_random_uuid(),
            user_id uuid not null references auth.users(id) on delete cascade,
            type text not null check (type in ('earn','spend','adjust')),
            token_type text not null check (token_type in ('LOVE','LOVE2')),
            amount numeric not null,
            balance_before numeric,
            balance_after numeric,
            description text,
            related_entity_type text,
            related_entity_id uuid,
            created_at timestamptz default now()
        );
        
        -- Note: We cannot automatically convert BIGINT to UUID, so we'll leave the temp table
        -- for manual data migration if needed
        
        RAISE NOTICE 'Converted token_transactions from BIGINT to UUID. Existing data preserved in token_transactions_temp. Manual migration may be required.';
    END IF;
END $$;

-- Now create the enhanced token_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.token_transactions (
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

-- Enable RLS
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "token_transactions_select_own" ON public.token_transactions;
DROP POLICY IF EXISTS "token_transactions_insert_own" ON public.token_transactions;

-- Create new policies with proper UUID handling
CREATE POLICY "token_transactions_select_own"
    ON public.token_transactions FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "token_transactions_insert_own"
    ON public.token_transactions FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

-- Grant permissions
GRANT ALL ON public.token_transactions TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON public.token_transactions(type);

-- Add comment explaining the fix
COMMENT ON TABLE public.token_transactions IS 'Enhanced token transactions with proper UUID references and expanded transaction types';