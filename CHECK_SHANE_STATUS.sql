-- CHECK SHANE'S CURRENT STATUS
-- This script will check if shane@thecyberdyne.com exists and what their current role is

-- Step 1: Check if user exists in public.users table
SELECT id, email, role, created_date, last_active 
FROM public.users 
WHERE email = 'shane@thecyberdyne.com';

-- Step 2: If no results, check auth.users table
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'shane@thecyberdyne.com';

-- Step 3: If user exists in auth.users but not public.users, we need to create the profile
-- This should happen automatically via trigger, but let's check