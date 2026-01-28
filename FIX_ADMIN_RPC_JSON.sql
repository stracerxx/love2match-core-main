-- ABSOLUTE FINAL FIX using RETURNS JSON
-- Bypasses "structure of query does not match function result type" issues
-- Returns a JSON array directly, which works transparently with the frontend

DROP FUNCTION IF EXISTS public.get_admin_users();

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS json
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result json;
BEGIN
  -- Strict Admin Check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  SELECT COALESCE(json_agg(t), '[]'::json)
  INTO result
  FROM (
    SELECT 
      p.id,
      p.auth_user_id,
      au.email,
      p.role,
      -- Use display_name as full_name
      p.display_name as full_name,
      p.created_at,
      au.last_sign_in_at,
      -- Aliases to match frontend expectation
      COALESCE(p.love_token_balance, 0) as love_balance,
      COALESCE(p.love2_token_balance, 0) as love2_balance,
      COALESCE(p.membership_tier, 'standard') as membership_tier,
      p.membership_expires_at
    FROM public.profiles p
    JOIN auth.users au ON p.auth_user_id = au.id
    ORDER BY p.created_at DESC
  ) t;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO service_role;

SELECT 'Function get_admin_users fixed using RETURNS JSON strategy.' as result;
