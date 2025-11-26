-- COMPLETE ADMIN SETUP FOR SHANE
-- This script will handle all scenarios to make shane@thecyberdyne.com an admin

-- Step 1: Check current status in public.users
SELECT 'Checking public.users table...' as step;
SELECT id, email, role, created_date, last_active 
FROM public.users 
WHERE email = 'shane@thecyberdyne.com';

-- Step 2: Check auth.users table
SELECT 'Checking auth.users table...' as step;
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'shane@thecyberdyne.com';

-- Step 3: If user exists in auth.users but not public.users, create profile
SELECT 'Creating profile if needed...' as step;
INSERT INTO public.users (id, email, display_name, full_name, role, referral_code)
SELECT 
    id, 
    email, 
    split_part(email, '@', 1) as display_name,
    split_part(email, '@', 1) as full_name,
    'admin' as role,
    substring(md5(random()::text) from 1 for 8) as referral_code
FROM auth.users 
WHERE email = 'shane@thecyberdyne.com'
AND NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'shane@thecyberdyne.com');

-- Step 4: Update existing user to admin (if profile exists)
SELECT 'Updating role to admin...' as step;
UPDATE public.users 
SET role = 'admin',
    last_active = now()
WHERE email = 'shane@thecyberdyne.com';

-- Step 5: Verify the update
SELECT 'Verifying admin role...' as step;
SELECT id, email, role, created_date, last_active 
FROM public.users 
WHERE email = 'shane@thecyberdyne.com';

-- Step 6: Show all admin users
SELECT 'All admin users:' as step;
SELECT id, email, role, created_date 
FROM public.users 
WHERE role = 'admin';

-- Step 7: Success message
SELECT 'Admin setup complete for shane@thecyberdyne.com!' as message;