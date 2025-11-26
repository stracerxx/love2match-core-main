-- Create public.users table for profiles
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  age_verified BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  account_type TEXT DEFAULT 'free',
  is_suspended BOOLEAN DEFAULT false,
  membership_tier TEXT DEFAULT 'basic',
  membership_expires_at TIMESTAMPTZ,
  daily_likes_remaining INTEGER DEFAULT 50,
  balances JSONB DEFAULT '{}'::jsonb,
  verification_count INTEGER DEFAULT 0,
  photos JSONB DEFAULT '[]'::jsonb,
  profile_videos JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  demographics JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  discovery_preferences JSONB DEFAULT '{}'::jsonb,
  is_online BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE,
  created_date TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view profiles
CREATE POLICY "Users can view all profiles"
  ON public.users
  FOR SELECT
  USING (true);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Admin override policy (commented out by default)
-- CREATE POLICY "Admins can update any profile"
--   ON public.users
--   FOR UPDATE
--   USING (is_admin());

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, full_name, referral_code)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    substring(md5(random()::text) from 1 for 8)
  );
  RETURN new;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();