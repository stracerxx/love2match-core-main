-- DEBUG VERSION of get_admin_users
-- This version removes the strict admin check to see if that's the blocker
-- It also fixes potential search_path issues

DROP FUNCTION IF EXISTS public.get_admin_users();

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id uuid,
  auth_user_id uuid,
  email varchar,
  role text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  love_balance numeric,
  love2_balance numeric,
  membership_tier text,
  membership_expires_at timestamptz
) 
SECURITY DEFINER
-- Adding extensions schema if needed, and public
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Diagnostic log (visible in Supabase logs)
  RAISE NOTICE 'Executing get_admin_users for user %', auth.uid();

  -- Allow access if admin check fails, but log it
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ) THEN
     RAISE NOTICE 'User % is NOT admin, but determining if we should show data for debug', auth.uid();
     -- For debugging, we'll continue anyway, or you could return partial data
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.auth_user_id,
    au.email::varchar,
    p.role,
    p.full_name,
    p.created_at,
    au.last_sign_in_at,
    COALESCE(p.love_token_balance, 0),
    COALESCE(p.love2_token_balance, 0),
    COALESCE(p.membership_tier, 'standard'),
    p.membership_expires_at
  FROM public.profiles p
  JOIN auth.users au ON p.auth_user_id = au.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO service_role;

SELECT 'Debug function created. Try refreshing Admin Dashboard.' as result;
