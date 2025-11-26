export { supabase } from '@/integrations/supabase/client';

export type UserProfile = {
  id: string;
  email: string;
  display_name: string;
  full_name: string;
  age_verified: boolean;
  role: 'member' | 'admin';
  account_type: string;
  is_suspended: boolean;
  membership_tier: string;
  membership_expires_at: string | null;
  daily_likes_remaining: number;
  balances: Record<string, number>;
  verification_count: number;
  photos: string[];
  profile_videos: string[];
  bio: string;
  demographics: Record<string, unknown>;
  tags: string[];
  discovery_preferences: Record<string, unknown>;
  is_online: boolean;
  referral_code: string;
  created_date: string;
  last_active: string;
};
