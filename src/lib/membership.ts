import { supabase } from '@/integrations/supabase/client';

export type MembershipTier = 'standard' | 'plus' | 'premium';

export interface MembershipStatus {
  tier: MembershipTier;
  isActive: boolean;
  expiresAt?: string;
  daysRemaining?: number;
}

/**
 * Check if a user has active Plus or Premium membership
 */
export const checkMembershipStatus = async (userId: string): Promise<MembershipStatus> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('membership_tier, membership_expires_at')
      .eq('auth_user_id', userId)
      .single();

    if (error || !profile) {
      return {
        tier: 'standard',
        isActive: false
      };
    }

    const tier = (profile.membership_tier as MembershipTier) || 'standard';
    const expiresAt = profile.membership_expires_at;
    
    if (tier === 'standard') {
      return {
        tier: 'standard',
        isActive: false
      };
    }

    const now = new Date();
    const expirationDate = expiresAt ? new Date(expiresAt) : null;
    const isActive = !expirationDate || expirationDate > now;
    
    let daysRemaining: number | undefined;
    if (expirationDate && isActive) {
      daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      tier,
      isActive,
      expiresAt: expiresAt || undefined,
      daysRemaining
    };
  } catch (error) {
    console.error('Error checking membership status:', error);
    return {
      tier: 'standard',
      isActive: false
    };
  }
};

/**
 * Check if content should be visible based on user's membership
 */
export const canViewContent = (contentTier: MembershipTier, userTier: MembershipTier): boolean => {
  const tierLevels = {
    'standard': 0,
    'plus': 1,
    'premium': 2
  };

  return tierLevels[userTier] >= tierLevels[contentTier];
};

/**
 * Get membership badge color and label
 */
export const getMembershipBadge = (tier?: MembershipTier) => {
  switch (tier) {
    case 'plus':
      return { label: 'Plus', color: 'bg-blue-500 text-white' };
    case 'premium':
      return { label: 'Premium', color: 'bg-purple-500 text-white' };
    default:
      return { label: 'Standard', color: 'bg-gray-500 text-white' };
  }
};

/**
 * Check if user can access Plus-only features
 */
export const hasPlusAccess = async (userId: string): Promise<boolean> => {
  const status = await checkMembershipStatus(userId);
  return status.tier === 'plus' || status.tier === 'premium';
};

/**
 * Check if user can access Premium-only features
 */
export const hasPremiumAccess = async (userId: string): Promise<boolean> => {
  const status = await checkMembershipStatus(userId);
  return status.tier === 'premium';
};

/**
 * Get membership benefits for each tier
 */
export const getMembershipBenefits = (tier: MembershipTier) => {
  const benefits = {
    standard: [
      'Basic profile features',
      'Limited daily likes',
      'Standard discovery filters',
      'Basic messaging'
    ],
    plus: [
      'All Standard benefits',
      'Unlimited daily likes',
      'Advanced discovery filters',
      'Priority in search results',
      'Plus-only content access',
      'Enhanced profile customization'
    ],
    premium: [
      'All Plus benefits',
      'Premium badge on profile',
      'Exclusive premium content',
      'Priority customer support',
      'Advanced analytics',
      'Creator verification eligibility'
    ]
  };

  return benefits[tier];
};