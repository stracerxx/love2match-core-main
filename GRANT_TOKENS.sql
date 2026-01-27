-- GRANT TOKENS TO ALL USERS (DEV HELPER)
-- This script updates the balance of all users to 1000 LOVE tokens.

BEGIN;

-- 1. Update public.users (Source of Truth)
UPDATE public.users
SET love_balance = 1000
WHERE love_balance < 1000;

-- 2. Update public.profiles (Read Model)
UPDATE public.profiles
SET love_token_balance = 1000
WHERE love_token_balance < 1000;

COMMIT;

SELECT 'Successfully granted 1000 tokens to all users.' as result;
