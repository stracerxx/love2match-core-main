-- Force update the user's role to admin
-- This script updates the profile for 'gamedesign2030@gmail.com' to be an admin
-- It also sets the role for the currently logged in user if run from the SQL Editor context

DO $$
DECLARE
  target_email text := 'gamedesign2030@gmail.com';
  target_user_id uuid;
BEGIN
  -- 1. Try to find user by email in profiles (if email is stored there)
  UPDATE public.profiles
  SET role = 'admin'
  WHERE email = target_email;
  
  -- 2. Also try to update based on auth.users lookup (more reliable if email not in profiles)
  -- This requires access to auth schema which might be restricted in some contexts
  -- but usually works in SQL Editor
  BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NOT NULL THEN
      UPDATE public.profiles
      SET role = 'admin'
      WHERE auth_user_id = target_user_id;
      
      RAISE NOTICE 'Updated role for user % (UUID: %)', target_email, target_user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not access auth.users or user not found';
  END;

  -- 3. If running as the user themselves (e.g. via API), update current user
  -- (This part might not be needed if run from SQL Editor, but good as backup)
  IF auth.uid() IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE auth_user_id = auth.uid();
    RAISE NOTICE 'Updated role for current authenticated user (UUID: %)', auth.uid();
  END IF;

END $$;

-- Verify the update
SELECT auth_user_id, email, role FROM public.profiles WHERE role = 'admin';
