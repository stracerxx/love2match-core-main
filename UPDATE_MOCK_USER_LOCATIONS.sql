-- ============================================================================
-- FIX MOCK USERS AND LOCATIONS (v3 - Constraint Fix)
-- ============================================================================
-- 1. Sync missing mock users from auth.users to public.users
-- 2. Ensure mandatory fields like full_name are populated
-- 3. Assign random US locations to all mock users
-- ============================================================================

-- Variables for cleanup logic
DO $$
DECLARE
    u_record RECORD;
    v_display_name TEXT;
BEGIN
    FOR u_record IN 
        SELECT id, email FROM auth.users WHERE email LIKE '%@example.com'
    LOOP
        -- Generate a readable name from email (e.g. nadia.ahmed30 -> Nadia Ahmed)
        v_display_name := INITCAP(REPLACE(SPLIT_PART(u_record.email, '@', 1), '.', ' '));
        
        -- Remove numbers from the end of the name if present
        v_display_name := REGEXP_REPLACE(v_display_name, '\d+$', '');

        INSERT INTO public.users (
            id, 
            email, 
            display_name, 
            full_name, 
            role, 
            is_suspended, 
            account_type, 
            membership_tier,
            demographics
        )
        VALUES (
            u_record.id, 
            u_record.email, 
            v_display_name, 
            v_display_name, -- Populate full_name to satisfy constraint
            'member',
            false,
            'free',
            'standard',
            '{}'::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            display_name = EXCLUDED.display_name;
    END LOOP;
END $$;

-- Update locations for the mock users
UPDATE public.users
SET demographics = demographics || CASE 
    WHEN email = 'nadia.ahmed30@example.com' THEN 
        '{"location": "New York, NY", "location_lat": 40.7128, "location_lng": -74.0060}'::jsonb
    WHEN email = 'david.keller45@example.com' THEN 
        '{"location": "Los Angeles, CA", "location_lat": 34.0522, "location_lng": -118.2437}'::jsonb
    WHEN email = 'taylor.lee25@example.com' THEN 
        '{"location": "Chicago, IL", "location_lat": 41.8781, "location_lng": -87.6298}'::jsonb
    WHEN email = 'samantha.reid26@example.com' THEN 
        '{"location": "Houston, TX", "location_lat": 29.7604, "location_lng": -95.3698}'::jsonb
    WHEN email = 'andre.vasquez28@example.com' THEN 
        '{"location": "Phoenix, AZ", "location_lat": 33.4484, "location_lng": -112.0740}'::jsonb
    WHEN email = 'elena.perez40@example.com' THEN 
        '{"location": "Miami, FL", "location_lat": 25.7617, "location_lng": -80.1918}'::jsonb
    WHEN email = 'kenji.tanaka34@example.com' THEN 
        '{"location": "Seattle, WA", "location_lat": 47.6062, "location_lng": -122.3321}'::jsonb
    WHEN email = 'aaliyah.james23@example.com' THEN 
        '{"location": "Denver, CO", "location_lat": 39.7392, "location_lng": -104.9903}'::jsonb
    WHEN email = 'marcus.cole32@example.com' THEN 
        '{"location": "Atlanta, GA", "location_lat": 33.7490, "location_lng": -84.3880}'::jsonb
    WHEN email = 'zoe.andrews29@example.com' THEN 
        '{"location": "Boston, MA", "location_lat": 42.3601, "location_lng": -71.0589}'::jsonb
    WHEN email = 'jasmine.robinson27@example.com' THEN 
        '{"location": "Las Vegas, NV", "location_lat": 36.1716, "location_lng": -115.1391}'::jsonb
    ELSE '{}'::jsonb
END
WHERE email LIKE '%@example.com';

-- Verify the result
SELECT 
    email, 
    display_name, 
    demographics->>'location' as city,
    demographics->>'location_lat' as lat,
    demographics->>'location_lng' as lng
FROM public.users
WHERE email LIKE '%@example.com'
ORDER BY email;
