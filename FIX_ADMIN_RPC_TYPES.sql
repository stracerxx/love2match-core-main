-- FINAL FIX for result type mismatch
-- Explicitly casts all columns to match RETURNS TABLE definition exactly

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
    p.role::text,
    -- Use display_name as full_name, cast to text
    p.display_name::text as full_name,
    p.created_at::timestamptz,
    au.last_sign_in_at::timestamptz,
    -- Explicitly cast balances to numeric
    COALESCE(p.love_token_balance, 0)::numeric,
    COALESCE(p.love2_token_balance, 0)::numeric,
    COALESCE(p.membership_tier, 'standard')::text,
    p.membership_expires_at::timestamptz
  FROM public.profiles p
  JOIN auth.users au ON p.auth_user_id = au.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO service_role;

SELECT 'Function get_admin_users fixed with explicit type casting.' as result;
