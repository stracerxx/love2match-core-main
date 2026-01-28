-- ADD FAUCET RATE LIMITING
-- Run this in Supabase SQL Editor to add proper server-side faucet rate limiting

-- Create faucet_claims table to track claims (if not exists)
CREATE TABLE IF NOT EXISTS public.faucet_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    claimed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faucet_claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "Users can view own faucet claims" ON public.faucet_claims;
CREATE POLICY "Users can view own faucet claims" ON public.faucet_claims
FOR SELECT USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_faucet_claims_user_id ON public.faucet_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_faucet_claims_claimed_at ON public.faucet_claims(claimed_at DESC);

-- Grant permissions
GRANT SELECT ON public.faucet_claims TO authenticated;
GRANT ALL ON public.faucet_claims TO service_role;

-- Drop and recreate the claim_daily_faucet function with proper rate limiting
CREATE OR REPLACE FUNCTION public.claim_daily_faucet()
RETURNS jsonb AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_last_claim timestamptz;
    v_amount numeric;
    v_current_balance numeric;
    v_new_balance numeric;
    v_hours_since_claim numeric;
BEGIN
    -- Check authentication
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Get faucet amount from config (default 50)
    SELECT value::numeric INTO v_amount FROM public.app_config WHERE key = 'daily_faucet_amount';
    v_amount := COALESCE(v_amount, 50);

    -- Check last claim time from faucet_claims table
    SELECT claimed_at INTO v_last_claim 
    FROM public.faucet_claims 
    WHERE user_id = v_user_id 
    ORDER BY claimed_at DESC 
    LIMIT 1;

    -- If user has claimed before, check if 24 hours have passed
    IF v_last_claim IS NOT NULL THEN
        v_hours_since_claim := EXTRACT(EPOCH FROM (now() - v_last_claim)) / 3600;
        
        IF v_hours_since_claim < 24 THEN
            RETURN jsonb_build_object(
                'success', false, 
                'error', 'You can only claim once every 24 hours',
                'hours_remaining', ROUND((24 - v_hours_since_claim)::numeric, 1),
                'next_claim_at', v_last_claim + interval '24 hours'
            );
        END IF;
    END IF;

    -- Get current balance from users table
    SELECT love_balance INTO v_current_balance FROM public.users WHERE id = v_user_id;
    
    IF v_current_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance + v_amount;
    
    -- Update users table (source of truth)
    UPDATE public.users SET love_balance = v_new_balance WHERE id = v_user_id;
    
    -- Record the claim
    INSERT INTO public.faucet_claims (user_id, amount) VALUES (v_user_id, v_amount);
    
    -- Record transaction
    INSERT INTO public.token_transactions (user_id, type, token_type, amount, balance_before, balance_after, description)
    VALUES (v_user_id, 'faucet', 'LOVE', v_amount, v_current_balance, v_new_balance, 'Daily faucet claim');

    RETURN jsonb_build_object(
        'success', true, 
        'amount', v_amount, 
        'new_balance', v_new_balance,
        'next_claim_at', now() + interval '24 hours'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.claim_daily_faucet() TO authenticated;

SELECT 'Faucet rate limiting added successfully!' as result;
