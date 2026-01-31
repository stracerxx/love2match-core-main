-- =====================================================
-- ADD MISSING COLUMNS TO USERS TABLE
-- =====================================================
-- Run this in the Supabase SQL Editor to add the missing
-- columns that the Profile page needs for saving preferences
-- =====================================================

-- Add notification_preferences column (JSONB for flexible structure)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"enabled": true, "email": true, "push": true, "sms": false}'::jsonb;

-- Add privacy_settings column (JSONB for flexible structure)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visible": true, "show_online_status": true, "allow_messaging": true, "show_location": false}'::jsonb;

-- Add discovery_preferences column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS discovery_preferences JSONB DEFAULT '{"radius": 50, "age_range": {"min": 18, "max": 99}, "show_me": "everyone"}'::jsonb;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this script, verify the columns exist:
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('notification_preferences', 'privacy_settings', 'discovery_preferences');
