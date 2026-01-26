import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

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
  total_love_supply: number;
  total_love2_supply: number;
  total_love_earned: number;
  total_love_spent: number;
  pending_swap_requests: number;
  pending_verifications: number;
};

interface ExchangeRequest {
  id: string;
  user_id: string;
  user_email: string;
  from_token: string;
  to_token: string;
  amount: number;
  status: string;
  created_at: string;
}

export const adminApi = {
  // Get platform analytics using direct queries
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    // Get total users from profiles table
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (usersError) throw usersError;

    // Get total LOVE supply (simplified)
    const total_love_supply = 0; // Temporarily set to 0 as balances might be in a different table or logic has changed

    // Get total LOVE2 supply (simplified)
    const total_love2_supply = 0; // Temporarily set to 0

    // Get pending swap requests
    const { count: pendingSwapRequests, error: swapError } = await supabase
      .from('swap_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (swapError) throw swapError;

    // For now, return simplified analytics
    return {
      total_users: totalUsers || 0,
      total_love_supply,
      total_love2_supply,
      total_love_earned: 0, // Would need transaction data
      total_love_spent: 0, // Would need transaction data
      pending_swap_requests: pendingSwapRequests || 0,
      pending_verifications: 0 // Would need verification requests table
    };
  },

  // Get all users with profile and user data
  async getAllUsers(): Promise<UserProfile[]> {
    const { data: users, error } = await supabase
      .rpc('get_admin_users');

    if (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }

    return (users || []).map((u: any) => ({
      id: u.id,
      auth_user_id: u.auth_user_id,
      email: u.email,
      role: u.role,
      full_name: u.full_name,
      created_date: u.created_at,
      love_token_balance: u.love_balance,
      love2_token_balance: u.love2_balance,
      membership_tier: u.membership_tier,
      membership_expires_at: u.membership_expires_at,
      last_sign_in_at: u.last_sign_in_at
    }));
  },

  // Update user role using direct update
  async updateUserRole(userId: string, newRole: string) {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
  },

  // Get pending swap requests (LOVE to LOVE2)
  async getPendingExchanges(): Promise<ExchangeRequest[]> {
    const { data: swapRequests, error: swapError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (swapError) throw swapError;

    if (!swapRequests || swapRequests.length === 0) return [];

    // Get profiles and users data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', swapRequests.map(req => req.user_id));

    if (profilesError) throw profilesError;

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', profiles?.map(p => p.auth_user_id) || []);

    if (usersError) throw usersError;

    return swapRequests.map(request => {
      const profile = profiles?.find(p => p.id === request.user_id);
      const user = users?.find(u => u.id === profile?.auth_user_id);

      return {
        id: request.id,
        user_id: profile?.auth_user_id || request.user_id.toString(),
        user_email: user?.email || 'Unknown',
        from_token: request.from_token_type,
        to_token: request.to_token_type,
        amount: Number(request.amount),
        status: request.status,
        created_at: request.created_at
      };
    });
  },

  // Approve swap request (temporarily disabled due to missing tables/migrations)
  async approveExchange(requestId: string) {
    console.warn(`Admin API: approveExchange(${requestId}) is disabled due to missing 'app_config' or 'treasury' tables.`);
    throw new Error('Exchange approval is currently disabled. Please ensure all related database tables and migrations are in place.');
  },

  // Reject swap request
  async rejectExchange(requestId: string) {
    const { error } = await supabase
      .from('swap_requests')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  },

  // Get user statistics
  async getUserStats() {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) throw usersError;

    const totalUsers = profiles?.length || 0;
    const adminUsers = users?.filter(user => user.role === 'admin').length || 0;
    const memberUsers = users?.filter(user => user.role === 'member').length || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = profiles?.filter(profile => new Date(profile.created_at) > sevenDaysAgo).length || 0;

    return {
      totalUsers,
      adminUsers,
      memberUsers,
      newUsers
    };
  },

  // Admin faucet functions
  async distributeTokens(userId: string, tokenType: 'LOVE' | 'LOVE2', amount: number, description: string) {
    // First get the profile ID from the auth_user_id
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, love_token_balance, love2_token_balance')
      .eq('auth_user_id', userId);

    if (profileError) throw profileError;
    const profile = profiles?.[0];
    if (!profile) throw new Error('Profile not found');

    const currentBalance = tokenType === 'LOVE' ? Number(profile.love_token_balance || 0) : Number(profile.love2_token_balance || 0);
    const newBalance = currentBalance + amount;

    // Update profile balance
    const updateField = tokenType === 'LOVE' ? { love_token_balance: newBalance } : { love2_token_balance: newBalance };
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateField)
      .eq('id', profile.id);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId, // Use auth_user_id (referenced in token_transactions)
        type: 'faucet',
        token_type: tokenType,
        amount: amount,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: description
      });

    if (transactionError) throw transactionError;

    return { success: true, newBalance };
  },

  async getFaucetStats() {
    // Get total faucet distributions
    const { data: faucetData, error: faucetError } = await supabase
      .from('token_transactions')
      .select('token_type, amount')
      .eq('type', 'faucet');

    if (faucetError) throw faucetError;

    const totalLOVEDistributed = faucetData
      ?.filter(tx => tx.token_type === 'LOVE')
      .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

    const totalLOVE2Distributed = faucetData
      ?.filter(tx => tx.token_type === 'LOVE2')
      .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

    return {
      totalLOVEDistributed,
      totalLOVE2Distributed,
      totalDistributions: faucetData?.length || 0
    };
  },

  // Plus membership management
  async updateUserMembership(userId: string, membershipTier: 'standard' | 'plus' | 'premium', expiresAt?: string) {
    // First get the profile ID from the auth_user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    const updateData: any = { membership_tier: membershipTier };

    if (expiresAt) {
      updateData.membership_expires_at = expiresAt;
    } else if (membershipTier === 'standard') {
      updateData.membership_expires_at = null;
    } else {
      // Set default expiration (30 days from now)
      const defaultExpiration = new Date();
      defaultExpiration.setDate(defaultExpiration.getDate() + 30);
      updateData.membership_expires_at = defaultExpiration.toISOString();
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);

    if (error) throw error;

    return { success: true, membership_tier: membershipTier, expires_at: updateData.membership_expires_at };
  },

  async getMembershipStats() {
    // Get all profiles with membership data
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('membership_tier, membership_expires_at, created_at');

    if (error) throw error;

    const totalUsers = profiles?.length || 0;
    const standardUsers = profiles?.filter(p => p.membership_tier === 'standard' || !p.membership_tier).length || 0;
    const plusUsers = profiles?.filter(p => p.membership_tier === 'plus').length || 0;
    const premiumUsers = profiles?.filter(p => p.membership_tier === 'premium').length || 0;

    // Count active subscriptions (not expired)
    const now = new Date();
    const activePlusUsers = profiles?.filter(p =>
      p.membership_tier === 'plus' &&
      (!p.membership_expires_at || new Date(p.membership_expires_at) > now)
    ).length || 0;

    const activePremiumUsers = profiles?.filter(p =>
      p.membership_tier === 'premium' &&
      (!p.membership_expires_at || new Date(p.membership_expires_at) > now)
    ).length || 0;

    return {
      totalUsers,
      standardUsers,
      plusUsers,
      premiumUsers,
      activePlusUsers,
      activePremiumUsers,
      totalActiveSubscriptions: activePlusUsers + activePremiumUsers
    };
  },

  // getTreasuryBalances and related functions are commented out or simplified
  // due to missing 'treasury' and 'app_config' tables after migrations removal.

  async getTreasuryBalances() {
    return [];
  },

  async getFeeConfig() {
    return [];
  },

  async updateFeeConfig(key: string, value: string) {
    throw new Error('Fee configuration update is currently disabled.');
  },

  async adjustTreasuryBalance(tokenType: string, amount: number, description?: string) {
    throw new Error('Treasury balance adjustments are currently disabled.');
  },

  async getTreasuryTransactions(limit = 50) {
    return [];
  }
};

export default adminApi;