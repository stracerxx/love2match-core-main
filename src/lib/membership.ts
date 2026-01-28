import { supabase } from '@/integrations/supabase/client';
import type { UserProfile } from './supabase';

export const MEMBERSHIP_CONFIG = {
  standard: { daily_like_limit: 10 },
  plus: { daily_like_limit: 50 },
  premium: { daily_like_limit: null }, // Unlimited
};

export type MembershipTier = 'standard' | 'plus' | 'premium';

export const getMembershipTier = (profile: UserProfile): MembershipTier => {
  const tier = profile.membership_tier?.toLowerCase() as MembershipTier;
  if (tier === 'plus' || tier === 'premium') {
    return tier;
  }
  return 'standard';
};

export const getMembershipBadge = (tier: MembershipTier): string => {
  switch (tier) {
    case 'premium':
      return '💎 Premium';
    case 'plus':
      return '✨ Plus';
    default:
      return 'Standard';
  }
};

/**
 * Check if a user can like based on their membership tier and daily usage
 * @param userId - The user's ID
 * @returns Object with canLike boolean and remaining likes count
 */
export const canUserLike = async (userId: string): Promise<{ canLike: boolean; remaining: number | null }> => {
  try {
    // Get user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('membership_tier, daily_likes_used, last_like_date')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user for like check:', userError);
      // Fallback: allow the like but log the error
      return { canLike: true, remaining: null };
    }

    if (!userData) {
      return { canLike: true, remaining: null };
    }

    const tier = (userData.membership_tier?.toLowerCase() || 'standard') as MembershipTier;
    const config = MEMBERSHIP_CONFIG[tier] || MEMBERSHIP_CONFIG.standard;

    // Premium users have unlimited likes
    if (config.daily_like_limit === null) {
      return { canLike: true, remaining: null };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastLikeDate = userData.last_like_date;

    // Reset counter if it's a new day
    if (lastLikeDate !== today) {
      // User hasn't liked today yet, they have full quota
      return {
        canLike: true,
        remaining: config.daily_like_limit
      };
    }

    // Check if user has likes remaining
    const likesUsed = userData.daily_likes_used || 0;
    const remaining = config.daily_like_limit - likesUsed;

    return {
      canLike: remaining > 0,
      remaining: Math.max(0, remaining)
    };
  } catch (error) {
    console.error('Error in canUserLike:', error);
    // Fallback: allow the like but log the error
    return { canLike: true, remaining: null };
  }
};

/**
 * Get the daily like limit for a membership tier
 */
export const getDailyLikeLimit = (tier: MembershipTier): number | null => {
  return MEMBERSHIP_CONFIG[tier]?.daily_like_limit ?? MEMBERSHIP_CONFIG.standard.daily_like_limit;
};

/**
 * Check if a membership has expired
 */
export const isMembershipExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

/**
 * Get effective membership tier (accounting for expiration)
 */
export const getEffectiveMembershipTier = (profile: UserProfile): MembershipTier => {
  const tier = getMembershipTier(profile);

  // If not standard, check if expired
  if (tier !== 'standard' && profile.membership_expires_at) {
    if (isMembershipExpired(profile.membership_expires_at)) {
      return 'standard';
    }
  }

  return tier;
};

/**
 * Get membership benefits description
 */
export const getMembershipBenefits = (tier: MembershipTier): string[] => {
  switch (tier) {
    case 'premium':
      return [
        'Unlimited daily likes',
        'See who liked you',
        'Priority in discovery',
        'Advanced filters',
        'Read receipts',
        'No ads',
        'Premium badge'
      ];
    case 'plus':
      return [
        '50 daily likes',
        'See who liked you',
        'Advanced filters',
        'No ads',
        'Plus badge'
      ];
    default:
      return [
        '10 daily likes',
        'Basic discovery',
        'Standard messaging'
      ];
  }
};
