-- FINAL FIX for get_admin_users
-- Resolves "column reference 'auth_user_id' is ambiguous" error
-- Restoration of security checks

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
SET search_path = public, auth
AS $$
BEGIN
  -- Strict Admin Check with Fully Qualified Columns
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p_check
    WHERE p_check.auth_user_id = auth.uid() AND p_check.role = 'admin'
  ) THEN
    -- Fallback: Check if user is service_role or has specific claim (optional, but sticking to strict role for now)
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

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO service_role;

SELECT 'Function get_admin_users fixed. Ambiguity resolved.' as result;
