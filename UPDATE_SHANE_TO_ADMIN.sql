-- UPDATE SHANE TO ADMIN ROLE
-- This script will update shane@thecyberdyne.com to have admin privileges

-- Step 1: Check current user status
SELECT id, email, role, created_date, last_active FROM public.users WHERE email = 'shane@thecyberdyne.com';

-- Step 2: Update the user role to admin
UPDATE public.users
SET role = 'admin',
    last_active = now()
WHERE email = 'shane@thecyberdyne.com';

-- Step 3: Verify the update was successful
SELECT id, email, role, created_date, last_active FROM public.users WHERE email = 'shane@thecyberdyne.com';

-- Step 4: Check all admin users
SELECT id, email, role, created_date FROM public.users WHERE role = 'admin';

-- Step 5: Success message
SELECT 'User shane@thecyberdyne.com has been updated to admin role!' as message;