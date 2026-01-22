-- QUICK FIX: Disable RLS on users and profiles tables to allow signup
-- This is a temporary solution to get the app working

-- Disable RLS on users table
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles table  
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

SELECT 'RLS disabled - signup should now work!' as result;
