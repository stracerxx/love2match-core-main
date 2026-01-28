-- Function to get all users with their emails and profile data
-- Only accessible by admins
-- UPDATED: Added auth_user_id and membership_expires_at
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
SET search_path = public
AS $$
BEGIN
  -- Check if the requesting user is an admin
  -- We check the profiles table for the current user's role
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
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

-- Grant access to authenticated users (function checks role internally)
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;

-- Notify success
SELECT 'Function get_admin_users updated successfully' as result;
