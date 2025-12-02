import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './supabase';

export const MEMBERSHIP_CONFIG = {
  STANDARD: { daily_like_limit: 10 },
  PLUS: { daily_like_limit: 50 },
  PREMIUM: { daily_like_limit: null }, // Unlimited
};

export type MembershipTier = keyof typeof MEMBERSHIP_CONFIG;

export const getMembershipTier = (profile: UserProfile): MembershipTier => {
  return (profile.membership_tier as MembershipTier) || 'STANDARD';
};
export const getMembershipBadge = (tier: MembershipTier): string => {
  switch (tier) {
    case 'PREMIUM':
      return '💎 Premium';
    case 'PLUS':
      return '✨ Plus';
    default:
      return 'Standard';
  }
};

export const canUserLike = async (userId: string): Promise<{ canLike: boolean; remaining: number | null }> => {
  // --- Roo: Modified due to missing columns after migrations removal ---
  // Temporarily allow all likes to stabilize the application
  // The increment_likes RPC call will still handle server-side tracking if available
  console.warn('`canUserLike` is temporarily allowing all likes due to missing `membership_tier`, `daily_likes_used`, and `last_like_date` columns. Please re-evaluate the like mechanism or re-add these columns.');
  return { canLike: true, remaining: null };
  // --- End Roo: Modified ---
};