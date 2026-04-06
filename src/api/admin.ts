import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Hardened dynamic threshold algorithm
export const getSwapApprovalThreshold = (userReputation: number, accountAgeDays: number) => {
  const baseThreshold = 100;
  // Dynamic scaling: Higher reputation/age allows higher volume
  const reputationFactor = Math.min(userReputation / 100, 2); 
  const ageFactor = Math.min(accountAgeDays / 365, 1);
  
  return Math.floor(baseThreshold * (1 + reputationFactor + ageFactor));
};

type AdminUserRow = {
  id: string;
  auth_user_id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  love_balance: number;
  love2_balance: number;
  membership_tier: string;
  membership_expires_at: string | null;
};

type UserProfile = {
  id: string;
  auth_user_id: string;
  email: string;
  role: string;
  created_date: string;
  love_token_balance?: number;
  love2_token_balance?: number;
  membership_tier?: string;
  membership_expires_at?: string;
  full_name?: string;
  last_sign_in_at?: string;
};

type PlatformAnalytics = {
  total_users: number;
  total_love_staked: number;
  active_faucets: number;
};
