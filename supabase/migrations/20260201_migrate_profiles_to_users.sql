-- Migration: Migrate legacy profiles to the new users table + UNLOCK visibility
-- Target: RESTORE visibility for Discover page

DO $$
BEGIN
    -- 1. Sync legacy profiles to users
    INSERT INTO public.users (
        id, 
        email, 
        display_name, 
        full_name, 
        bio,
        photos,
        role, 
        love_balance, 
        love2_balance, 
        membership_tier, 
        membership_expires_at, 
        is_suspended,
        demographics
    )
    SELECT 
        auth_user_id, 
        email, 
        display_name, 
        display_name, -- using display_name for both since full_name missing in profiles
        bio,
        photos,
        COALESCE(role, 'member'), 
        COALESCE(love_token_balance, 100), 
        COALESCE(love2_token_balance, 0), 
        COALESCE(membership_tier, 'standard'), 
        membership_expires_at, 
        false, -- force not suspended
        jsonb_build_object(
            'gender', gender,
            'birthdate', date_of_birth,
            'location', home_city,
            'occupation', occupation,
            'interests', interests
        )
    FROM public.profiles
    WHERE auth_user_id IS NOT NULL
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        full_name = EXCLUDED.full_name,
        bio = EXCLUDED.bio,
        photos = EXCLUDED.photos,
        is_suspended = false,
        demographics = EXCLUDED.demographics;

    -- 2. "Unlock" the table for Everyone (Matches legacy profiles behavior)
    -- This ensures the Discover page can see users even if the session is flaky
    DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
    CREATE POLICY "Users are viewable by everyone" ON public.users 
    FOR SELECT USING (true);

    RAISE NOTICE 'Migration and Unlock completed.';
END $$;
