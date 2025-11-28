-- SETUP ADMIN USER FOR LOVE2MATCH
-- This script helps you set up an admin user to access the admin dashboard

-- Step 1: Check if you have existing users and their roles
SELECT id, email, role FROM public.users LIMIT 10;

-- Step 2: Update an existing user to be admin (replace 'user@example.com' with actual email)
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'shane@thecyberdyne.com';

-- Step 3: Alternative - Create a new admin user if needed
-- First sign up normally through the app, then run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-new-admin-email@example.com';

-- Step 4: Verify the admin user
SELECT id, email, role FROM public.users WHERE role = 'admin';

-- Step 5: Access the admin dashboard
-- 1. Sign in with the admin user account
-- 2. Look for the Shield icon (⚔️) in the navigation
-- 3. Click on it to access the admin dashboard at: http://localhost:8080/admin
                                                                                                                                                                                                                                 
-- If you don't see the admin link, check that:
-- 1. The user has role = 'admin' in the users table
-- 2. You're signed in with that user account
-- 3. The app is running at http://localhost:8080/

-- Step 6: Optional - Create a test admin user (if you need a new user)
-- Note: You need to sign up through the app first, then update the role
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES ('admin@love2match.com', crypt('admin123', gen_salt('bf')), now(), now(), now());

-- Then update the public.users table:
-- INSERT INTO public.users (id, email, role, display_name, created_at, updated_at)
-- SELECT id, email, 'admin', 'Admin User', now(), now()
-- FROM auth.users WHERE email = 'admin@love2match.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

SELECT 'Admin setup complete! Check the results above.' as message;