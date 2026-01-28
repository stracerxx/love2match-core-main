/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile } from './supabase';

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { profile: null, error: { message: error.message } };
  }

  return { profile: data as UserProfile, error: null };
};

/**
 * Transform flat form data into the nested structure expected by the database
 */
function transformFormDataToDbFormat(updates: Record<string, any>): Record<string, any> {
  const dbUpdates: Record<string, any> = {};

  // Direct fields that map 1:1
  const directFields = ['display_name', 'full_name', 'bio', 'photos', 'profile_videos', 'tags'];

  // Demographics fields
  const demographicsFields = [
    'location', 'location_lat', 'location_lng', 'interests', 'relationship_goals',
    'height', 'occupation', 'education', 'languages', 'zodiac_sign',
    'drinking_habits', 'smoking_habits', 'exercise_habits', 'religion',
    'political_views', 'has_pets', 'wants_children', 'personality_type',
    'love_language', 'dealbreakers', 'ideal_date', 'social_media_links'
  ];

  // Discovery preference fields
  const discoveryFields = ['discovery_radius', 'age_range_min', 'age_range_max', 'show_me'];

  // Notification preference fields
  const notificationFields = ['notification_enabled', 'email_notifications', 'push_notifications', 'sms_notifications'];

  // Privacy setting fields
  const privacyFields = ['privacy_profile_visible', 'privacy_show_online_status', 'privacy_allow_messaging', 'privacy_show_location'];

  // Copy direct fields
  for (const field of directFields) {
    if (updates[field] !== undefined) {
      dbUpdates[field] = updates[field];
    }
  }

  // Build demographics object
  const hasDemographicsFields = demographicsFields.some(f => updates[f] !== undefined);
  if (hasDemographicsFields) {
    const demographics: Record<string, any> = {};

    for (const field of demographicsFields) {
      if (updates[field] !== undefined) {
        // Handle array fields that come as comma-separated strings
        if (field === 'interests' || field === 'languages' || field === 'social_media_links') {
          const value = updates[field];
          if (typeof value === 'string') {
            demographics[field] = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
          } else if (Array.isArray(value)) {
            demographics[field] = value;
          }
        } else {
          demographics[field] = updates[field];
        }
      }
    }

    if (Object.keys(demographics).length > 0) {
      dbUpdates.demographics = demographics;
    }
  }

  // Build discovery_preferences object
  const hasDiscoveryFields = discoveryFields.some(f => updates[f] !== undefined);
  if (hasDiscoveryFields) {
    const discovery: Record<string, any> = {};

    if (updates.discovery_radius !== undefined) {
      discovery.radius = parseInt(updates.discovery_radius, 10) || 50;
    }

    if (updates.age_range_min !== undefined || updates.age_range_max !== undefined) {
      discovery.age_range = {
        min: parseInt(updates.age_range_min, 10) || 18,
        max: parseInt(updates.age_range_max, 10) || 99
      };
    }

    if (updates.show_me !== undefined) {
      discovery.show_me = updates.show_me;
    }

    if (Object.keys(discovery).length > 0) {
      dbUpdates.discovery_preferences = discovery;
    }
  }

  // Build notification_preferences object
  const hasNotificationFields = notificationFields.some(f => updates[f] !== undefined);
  if (hasNotificationFields) {
    const notifications: Record<string, any> = {};

    if (updates.notification_enabled !== undefined) {
      notifications.enabled = updates.notification_enabled;
    }
    if (updates.email_notifications !== undefined) {
      notifications.email = updates.email_notifications;
    }
    if (updates.push_notifications !== undefined) {
      notifications.push = updates.push_notifications;
    }
    if (updates.sms_notifications !== undefined) {
      notifications.sms = updates.sms_notifications;
    }

    if (Object.keys(notifications).length > 0) {
      dbUpdates.notification_preferences = notifications;
    }
  }

  // Build privacy_settings object
  const hasPrivacyFields = privacyFields.some(f => updates[f] !== undefined);
  if (hasPrivacyFields) {
    const privacy: Record<string, any> = {};

    if (updates.privacy_profile_visible !== undefined) {
      privacy.profile_visible = updates.privacy_profile_visible;
    }
    if (updates.privacy_show_online_status !== undefined) {
      privacy.show_online_status = updates.privacy_show_online_status;
    }
    if (updates.privacy_allow_messaging !== undefined) {
      privacy.allow_messaging = updates.privacy_allow_messaging;
    }
    if (updates.privacy_show_location !== undefined) {
      privacy.show_location = updates.privacy_show_location;
    }

    if (Object.keys(privacy).length > 0) {
      dbUpdates.privacy_settings = privacy;
    }
  }

  // If no transformation was needed (e.g., just updating photos), return original
  if (Object.keys(dbUpdates).length === 0) {
    return updates;
  }

  return dbUpdates;
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile> | Record<string, any>) => {
  // Transform flat form data to nested DB format
  const dbUpdates = transformFormDataToDbFormat(updates as Record<string, any>);

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: { message: error.message } };
  }

  return { profile: data as UserProfile, error: null };
};

export const getDiscoverProfiles = async (currentUserId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .neq('id', currentUserId)
    .eq('is_suspended', false)
    .order('last_active', { ascending: false })
    .limit(limit);

  if (error) {
    return { profiles: [], error: { message: error.message } };
  }

  return { profiles: data as UserProfile[], error: null };
};
