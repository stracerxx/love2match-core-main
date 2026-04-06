-- ============================================================================
-- CONSOLIDATED MAKE ADMIN SCRIPT
-- ============================================================================
-- Use this script in the Supabase SQL Editor to grant Admin privileges.
-- It updates both the 'users' and 'profiles' tables to ensure consistency.

DO $$
DECLARE
    -- CHANGE THIS EMAIL to the user you want to make an admin
    target_email text := 'gamedesign2030@gmail.com'; 
    target_user_id uuid;
BEGIN
    -- 1. Find the User ID from auth.users
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', target_email;
    END IF;

    -- 2. Update public.users table
    UPDATE public.users 
    SET role = 'admin' 
    WHERE id = target_user_id;
    
    -- 3. Update public.profiles table (legacy/compatibility)
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE auth_user_id = target_user_id;

    RAISE NOTICE 'SUCCESS: Role updated to "admin" for % (UUID: %)', target_email, target_user_id;
END $$;

-- Verify the results
SELECT 'users' as source, id, email, role FROM public.users WHERE role = 'admin'
UNION ALL
SELECT 'profiles' as source, auth_user_id as id, email, role FROM public.profiles WHERE role = 'admin';
