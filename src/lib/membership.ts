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
  const { data: user, error } = await supabase
    .from('users')
    .select('membership_tier, daily_likes_used, last_like_date')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { canLike: false, remaining: 0 };
  }

  const tier = getMembershipTier(user as UserProfile);
  const limit = MEMBERSHIP_CONFIG[tier].daily_like_limit;

  if (limit === null) {
    return { canLike: true, remaining: null };
  }

  const today = new Date().toISOString().split('T')[0];
  const lastLikeDate = user.last_like_date;
  const likesUsed = user.daily_likes_used || 0;

  if (lastLikeDate !== today) {
    // Reset daily likes if it's a new day
    return { canLike: true, remaining: limit };
  }

  if (likesUsed >= limit) {
    return { canLike: false, remaining: 0 };
  }

  return { canLike: true, remaining: limit - likesUsed };
};