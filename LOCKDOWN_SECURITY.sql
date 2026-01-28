-- SECURITY LOCKDOWN: Prevent Self-Promotion
-- This script secures the profiles table to ensure users cannot make themselves admins.

-- 1. Enable RLS (in case it was disabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update policies to clear the slate
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update" ON public.profiles;

-- 3. Create a strict UPDATE policy
-- Users can update their own rows, BUT this policy alone doesn't restrict columns.
-- We must rely on a BEFORE UPDATE trigger or a check constraint for column-level security in strict environments,
-- but for Supabase RLS, we can use a check condition.

CREATE POLICY "Users can update own profile details" ON public.profiles 
FOR UPDATE 
USING (auth.uid() = auth_user_id)
WITH CHECK (
  auth.uid() = auth_user_id 
  AND (
    -- PREVENT changing the role: The new role must match the old role.
    -- Note: RLS 'WITH CHECK' compares the NEW row state. 
    -- To strictly prevent role changes, we basically need to trust that the application
    -- doesn't send a new role, or if it does, it matches the existing one.
    -- However, a better way in Postgres RLS is ensuring normal users can't touch the role at all.
    -- Use a trigger for absolute safety.
    true
  )
);

-- 4. Create a Trigger to ABSOLUTELY FORBID role changes by non-admins
CREATE OR REPLACE FUNCTION public.protect_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is being changed...
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- And the user making the change is NOT a service_role or admin...
    -- (We check the current jwt claim role or a specific admin table check)
    IF auth.role() != 'service_role' THEN
        -- Check if the executor is an admin in the profiles table
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'You are not authorized to change user roles.';
        END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the trigger
DROP TRIGGER IF EXISTS protect_role_update ON public.profiles;
CREATE TRIGGER protect_role_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_role_change();

SELECT 'Security Lockdown Applied: Users can no longer change their own role.' as result;
