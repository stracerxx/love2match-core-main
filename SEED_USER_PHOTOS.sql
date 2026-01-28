-- ============================================================================
-- SEED USER PHOTOS WITH PLACEHOLDERS
-- ============================================================================
-- This script adds high-quality Unsplash placeholder images to existing users
-- so the Discover page looks populated.
-- Run this in the Supabase SQL Editor.
-- ============================================================================

-- Update users with some diverse placeholder photos
-- We use a CASE statement to give different photos to different users based on their ID

UPDATE public.users
SET photos = CASE 
    WHEN email LIKE 'shane%' THEN '["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN email LIKE 'admin%' THEN '["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%0%' THEN '["https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%1%' THEN '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%2%' THEN '["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%3%' THEN '["https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%4%' THEN '["https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%5%' THEN '["https://images.unsplash.com/photo-1542206395-903ed74e077a?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%6%' THEN '["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%7%' THEN '["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%8%' THEN '["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80"]'::jsonb
    WHEN id::text LIKE '%9%' THEN '["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"]'::jsonb
    ELSE '["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"]'::jsonb
END
WHERE photos IS NULL OR photos::text = '[]' OR photos::text = '{}';

-- Notify success
SELECT count(*) as users_updated_with_photos FROM public.users WHERE photos::text != '[]' AND photos::text != '{}' AND photos IS NOT NULL;
