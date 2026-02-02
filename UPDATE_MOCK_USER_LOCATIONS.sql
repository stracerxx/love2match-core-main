-- ============================================================================
-- UPDATE MOCK USER LOCATIONS
-- ============================================================================
-- This script assigns random (but consistent) US locations to the mock users
-- with @example.com emails. This ensures the Discover page looks populated
-- with users from different regions when location filtering is applied.
-- ============================================================================

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

-- Verify the updates
SELECT 
    email, 
    display_name, 
    demographics->>'location' as city,
    demographics->>'location_lat' as lat,
    demographics->>'location_lng' as lng
FROM public.users
WHERE email LIKE '%@example.com'
ORDER BY email;
