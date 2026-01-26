-- GLOBAL SECURITY LOCKDOWN AND RLS HARDENING (v2 - Fixed uuid/bigint mismatch)
-- This script enables RLS on all tables and applies strict access control policies.

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.thread_participants ENABLE ROW LEVEL SECURITY;

-- 2. CLEAN UP OLD POLICIES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. USERS TABLE POLICIES (Using ::text for id comparison to avoid uuid/bigint mismatch)
CREATE POLICY "Users can manage own record" ON public.users 
FOR ALL USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text);

-- 4. PROFILES TABLE POLICIES
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles 
FOR SELECT USING (true);

CREATE POLICY "Users can manage own profile" ON public.profiles 
FOR UPDATE USING (auth.uid()::text = auth_user_id::text) WITH CHECK (auth.uid()::text = auth_user_id::text);

CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid()::text = auth_user_id::text);

-- 5. TOKEN TRANSACTIONS POLICIES (Owner read-only, Admin full)
CREATE POLICY "Users can view own transactions" ON public.token_transactions 
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service and Admin can manage transactions" ON public.token_transactions 
FOR ALL USING (
    auth.role() = 'service_role' OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id::text = auth.uid()::text AND role = 'admin')
);

-- 6. SWAP REQUESTS POLICIES
CREATE POLICY "Users can view own swap requests" ON public.swap_requests 
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create swap requests" ON public.swap_requests 
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage swap requests" ON public.swap_requests 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id::text = auth.uid()::text AND role = 'admin'));

-- 7. MESSAGING POLICIES (Participant only)
CREATE POLICY "Participants can view threads" ON public.threads 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.thread_participants WHERE thread_id = id AND user_id::text = auth.uid()::text)
);

CREATE POLICY "Participants can view messages" ON public.messages 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.thread_participants WHERE thread_id = messages.thread_id AND user_id::text = auth.uid()::text)
);

CREATE POLICY "Users can send messages to own threads" ON public.messages 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.thread_participants WHERE thread_id = thread_id AND user_id::text = auth.uid()::text)
);

-- 8. APP CONFIG (Public Read, Admin Write)
CREATE POLICY "Config is readable by everyone" ON public.app_config 
FOR SELECT USING (true);

CREATE POLICY "Admin can manage config" ON public.app_config 
FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id::text = auth.uid()::text AND role = 'admin'));

-- 9. ROLE PROTECTION TRIGGER
CREATE OR REPLACE FUNCTION public.protect_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() != 'service_role' THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id::text = auth.uid()::text AND role = 'admin') THEN
        RAISE EXCEPTION 'Role changes are restricted to administrators.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_role_update ON public.profiles;
CREATE TRIGGER protect_role_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_role_change();

-- 10. PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

SELECT 'Global Security Lockdown Applied' as result;
