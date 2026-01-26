-- FIX FOR TOKEN FAUCET CONSTRAINTS
-- Adds 'faucet' to the allowed types in token_transactions

-- 1. Identify the constraint name (usually token_transactions_type_check)
-- 2. Drop it and recreate it with 'faucet' included

ALTER TABLE public.token_transactions 
DROP CONSTRAINT IF EXISTS token_transactions_type_check;

ALTER TABLE public.token_transactions 
ADD CONSTRAINT token_transactions_type_check 
CHECK (type IN ('earn', 'spend', 'adjust', 'swap', 'gift', 'purchase', 'referral', 'creator_earnings', 'faucet'));

-- Verify
SELECT 'Token transactions constraint updated to include faucet' as result;
