-- SIMPLIFIED RLS FIX - Only fix what's needed for signup to work
-- This focuses on users and profiles tables only

-- Enable RLS on users table (if it exists)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow individual insert" ON public.users;
DROP POLICY IF EXISTS "Allow individual select" ON public.users;
DROP POLICY IF EXISTS "Allow individual update" ON public.users;

-- Allow users to insert their own profile in users table
CREATE POLICY "Allow individual insert" ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile in users table
CREATE POLICY "Allow individual select" ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile in users table
CREATE POLICY "Allow individual update" ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Enable RLS on profiles table
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow users to read all profiles (for discovery/matching)
CREATE POLICY "Users can read all profiles" ON public.profiles 
FOR SELECT 
USING (true);

-- Allow users to insert their own profile (using auth_user_id column)
CREATE POLICY "Users can insert own profile" ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = auth_user_id);

-- Allow users to update their own profile (using auth_user_id column)
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- Success message
SELECT 'RLS policies for users and profiles updated successfully!' as result;
SELECT 'You can now create accounts. Other table policies can be added later.' as note;

