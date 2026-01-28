-- ADD/UPDATE NOTIFICATIONS TABLE
-- The notifications table already exists with bigint columns
-- This script adds missing columns and updates RLS policies

-- First, check if the table exists and add any missing columns
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE public.notifications ADD COLUMN type text DEFAULT 'system';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title') THEN
        ALTER TABLE public.notifications ADD COLUMN title text DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'body') THEN
        ALTER TABLE public.notifications ADD COLUMN body text DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url') THEN
        ALTER TABLE public.notifications ADD COLUMN action_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_user_id') THEN
        ALTER TABLE public.notifications ADD COLUMN related_user_id bigint;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_entity_type') THEN
        ALTER TABLE public.notifications ADD COLUMN related_entity_type text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_entity_id') THEN
        ALTER TABLE public.notifications ADD COLUMN related_entity_id text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE public.notifications ADD COLUMN is_read boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE public.notifications ADD COLUMN read_at timestamptz;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'image_url') THEN
        ALTER TABLE public.notifications ADD COLUMN image_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'created_at') THEN
        ALTER TABLE public.notifications ADD COLUMN created_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create a helper function to get the current user's profile id (bigint)
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS bigint AS $$
DECLARE
    v_profile_id bigint;
BEGIN
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = auth.uid();
    RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Users can only view their own notifications (using bigint user_id)
CREATE POLICY "Users can view own notifications" ON public.notifications 
FOR SELECT USING (user_id = public.get_current_user_profile_id());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications 
FOR UPDATE USING (user_id = public.get_current_user_profile_id());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications 
FOR DELETE USING (user_id = public.get_current_user_profile_id());

-- Users can insert their own notifications
CREATE POLICY "Users can insert own notifications" ON public.notifications 
FOR INSERT WITH CHECK (user_id = public.get_current_user_profile_id());

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Grant permissions
GRANT SELECT, UPDATE, DELETE, INSERT ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_profile_id() TO authenticated;

SELECT 'Notifications table updated successfully!' as result;
