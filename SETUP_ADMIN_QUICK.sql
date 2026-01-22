-- SETUP ADMIN USER FOR LOVE2MATCH
-- Quick admin setup script

-- Step 1: First, sign up through the app at http://localhost:8080/auth
-- Use the email address you want to be the admin

-- Step 2: After signing up, run this script to grant admin privileges
-- IMPORTANT: Replace 'YOUR_EMAIL_HERE' with your actual email address

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE@example.com';  -- ⚠️ CHANGE THIS LINE!

-- Step 3: Verify the admin user was created
SELECT 
    id, 
    email, 
    role,
    display_name,
    created_date
FROM public.users 
WHERE role = 'admin';

-- You should see your user with role = 'admin'
-- If the table is empty, make sure you:
-- 1. Signed up through the app first
-- 2. Used the correct email address in the UPDATE statement above

SELECT '✅ Admin setup complete! Sign in with your admin account to see the Shield icon in navigation.' as message;
