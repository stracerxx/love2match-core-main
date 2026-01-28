-- FIX for missing "full_name" column
-- Maps display_name to full_name in the output
-- Keeps the variable_conflict directive

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
#variable_conflict use_column
BEGIN
  -- Strict Admin Check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.auth_user_id,
    au.email::varchar,
    p.role,
    -- Use display_name as full_name since full_name doesn't exist
    p.display_name as full_name,
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

SELECT 'Function get_admin_users fixed. Mapped display_name to full_name.' as result;
