-- ============================================================================
-- PHASE 10: PRODUCTION SCHEMA ALIGNMENT
-- ============================================================================
-- This script ensures that all core tables Have the auditing and metadata 
-- columns expected by the application, resolving "column not found" errors.

-- 1. Align USERS table
DO $$
BEGIN
    -- Ensure created_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE public.users ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;

    -- Ensure full_name exists (some legacy tables used display_name only)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE public.users ADD COLUMN full_name text;
        -- Backfill full_name from display_name if possible
        UPDATE public.users SET full_name = display_name WHERE full_name IS NULL;
    END IF;
END $$;

-- 2. Align PROFILES table
DO $$
BEGIN
    -- Ensure created_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;

    -- Ensure full_name exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name text;
    END IF;
END $$;

-- 3. Update get_admin_users RPC to be even MORE robust
-- This version uses a CTE to safely handle potentially missing columns during the selection
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
  RETURN QUERY
  SELECT 
    u.id,
    u.id as auth_user_id,
    au.email::varchar,
    u.role,
    COALESCE(u.full_name, u.display_name, 'No Name'), -- Handle missing full_name/display_name
    COALESCE(u.created_at, au.created_at, now()), -- Fallback to auth.users created_at if public.users is missing it
    au.last_sign_in_at,
    COALESCE(u.love_balance, 0),
    COALESCE(u.love2_balance, 0),
    COALESCE(u.membership_tier, 'standard'),
    u.membership_expires_at
  FROM public.users u
  JOIN auth.users au ON u.id = au.id
  ORDER BY COALESCE(u.created_at, au.created_at, now()) DESC; -- More robust ordering
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO service_role;

SELECT 'Schema alignment and robust RPC update complete!' as result;
