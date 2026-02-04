import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export interface UserDemographics {
  location?: string;
  location_lat?: number | string;
  location_lng?: number | string;
  interests?: string[];
  relationship_goals?: string;
  height?: string;
  occupation?: string;
  education?: string;
  languages?: string[];
  zodiac_sign?: string;
  drinking_habits?: string;
  smoking_habits?: string;
  exercise_habits?: string;
  religion?: string;
  political_views?: string;
  has_pets?: boolean;
  wants_children?: boolean;
  personality_type?: string;
  love_language?: string;
  dealbreakers?: string;
  ideal_date?: string;
  social_media_links?: string[];
}

export interface DiscoveryPreferences {
  radius?: number;
  age_range?: { min: number; max: number };
  show_me?: string;
}

export interface NotificationPreferences {
  enabled?: boolean;
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}

export interface PrivacySettings {
  profile_visible?: boolean;
  show_online_status?: boolean;
  allow_messaging?: boolean;
  show_location?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  full_name?: string;
  role?: string;
  bio?: string;
  photos?: string[];
  tags?: string[];
  demographics?: UserDemographics;
  discovery_preferences?: DiscoveryPreferences;
  notification_preferences?: NotificationPreferences;
  privacy_settings?: PrivacySettings;
  love_token_balance?: number;
  love2_token_balance?: number;
  [key: string]: any; // Keep this for now to avoid breaking other things while I refine
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { profile: data, error };
};
