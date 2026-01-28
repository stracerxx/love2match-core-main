/* eslint-disable @typescript-eslint/no-explicit-any */
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

/**
 * Helper function to sync balances between users and profiles tables
 */
async function syncBalancesToProfiles(userId: string, loveBalance: number, love2Balance: number) {
  try {
    await supabase
      .from('profiles')
      .update({
        love_token_balance: loveBalance,
        love2_token_balance: love2Balance,
      })
      .eq('auth_user_id', userId);
  } catch (error) {
    console.warn('Failed to sync balances to profiles table:', error);
  }
}

export const adminApi = {
  /**
   * Get platform analytics using direct queries from users table
   */
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (usersError) throw usersError;

    // Get total LOVE supply from users table
    const { data: loveData, error: loveError } = await supabase
      .from('users')
      .select('love_balance');
    if (loveError) throw loveError;

    const total_love_supply = loveData?.reduce((sum, user) => sum + Number(user.love_balance || 0), 0) || 0;

    // Get total LOVE2 supply from users table
    const { data: love2Data, error: love2Error } = await supabase
      .from('users')
      .select('love2_balance');
    if (love2Error) throw love2Error;

    const total_love2_supply = love2Data?.reduce((sum, user) => sum + Number(user.love2_balance || 0), 0) || 0;

    // Get transaction totals
    const { data: earnData } = await supabase
      .from('token_transactions')
      .select('amount')
      .eq('type', 'earn')
      .eq('token_type', 'LOVE');

    const total_love_earned = earnData?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0;

    const { data: spendData } = await supabase
      .from('token_transactions')
      .select('amount')
      .eq('type', 'spend')
      .eq('token_type', 'LOVE');

    const total_love_spent = spendData?.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) || 0;

    // Get pending swap requests
    const { count: pendingSwapRequests, error: swapError } = await supabase
      .from('swap_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (swapError) throw swapError;

    return {
      total_users: totalUsers || 0,
      total_love_supply,
      total_love2_supply,
      total_love_earned,
      total_love_spent,
      pending_swap_requests: pendingSwapRequests || 0,
      pending_verifications: 0
    };
  },

  /**
   * Get all users with profile data using the RPC function
   */
  async getAllUsers(): Promise<UserProfile[]> {
    const { data: users, error } = await supabase.rpc('get_admin_users');

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

  /**
   * Update user role - updates both users and profiles tables
   */
  async updateUserRole(userId: string, newRole: 'member' | 'admin' | 'moderator') {
    // Update users table
    const { error: userError } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (userError) throw userError;

    // Also update profiles table for consistency
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('auth_user_id', userId);
  },

  /**
   * Get pending swap requests (LOVE to LOVE2)
   */
  async getPendingExchanges(): Promise<ExchangeRequest[]> {
    const { data: swapRequests, error: swapError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (swapError) throw swapError;
    if (!swapRequests || swapRequests.length === 0) return [];

    // Get user data for each request
    const userIds = swapRequests.map(req => req.user_id).filter(Boolean);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (usersError) throw usersError;

    return swapRequests.map(request => {
      const user = users?.find(u => u.id === request.user_id);
      return {
        id: request.id,
        user_id: request.user_id || '',
        user_email: user?.email || 'Unknown',
        from_token: request.from_token_type,
        to_token: request.to_token_type,
        amount: Number(request.amount),
        status: request.status,
        created_at: request.created_at
      };
    });
  },

  /**
   * Approve swap request - deducts LOVE and adds LOVE2
   */
  async approveExchange(requestId: string) {
    // Get the swap request
    const { data: request, error: reqError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqError || !request) throw new Error('Swap request not found');
    if (request.status !== 'pending') throw new Error('Request is not pending');

    const userId = request.user_id;
    const amount = Number(request.amount);

    // Get current user balances
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('love_balance, love2_balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) throw new Error('User not found');

    const currentLove = Number(userData.love_balance || 0);
    const currentLove2 = Number(userData.love2_balance || 0);

    if (currentLove < amount) {
      throw new Error('User has insufficient LOVE balance');
    }

    const newLoveBalance = currentLove - amount;
    const newLove2Balance = currentLove2 + amount;

    // Update user balances
    const { error: updateError } = await supabase
      .from('users')
      .update({
        love_balance: newLoveBalance,
        love2_balance: newLove2Balance
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Sync to profiles table
    await syncBalancesToProfiles(userId, newLoveBalance, newLove2Balance);

    // Record the transactions
    await supabase.from('token_transactions').insert([
      {
        user_id: userId,
        type: 'swap',
        token_type: 'LOVE',
        amount: -amount,
        balance_before: currentLove,
        balance_after: newLoveBalance,
        description: `Exchange ${amount} LOVE to LOVE2 (approved)`
      },
      {
        user_id: userId,
        type: 'swap',
        token_type: 'LOVE2',
        amount: amount,
        balance_before: currentLove2,
        balance_after: newLove2Balance,
        description: `Exchange ${amount} LOVE to LOVE2 (approved)`
      }
    ]);

    // Update swap request status
    const { error: statusError } = await supabase
      .from('swap_requests')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (statusError) throw statusError;

    return { success: true, newLoveBalance, newLove2Balance };
  },

  /**
   * Reject swap request
   */
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

  /**
   * Get user statistics
   */
  async getUserStats() {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('role, created_at');

    if (usersError) throw usersError;

    const totalUsers = users?.length || 0;
    const adminUsers = users?.filter(user => user.role === 'admin').length || 0;
    const memberUsers = users?.filter(user => user.role === 'member').length || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = users?.filter(user => new Date(user.created_at) > sevenDaysAgo).length || 0;

    return {
      totalUsers,
      adminUsers,
      memberUsers,
      newUsers
    };
  },

  /**
   * Admin faucet - distribute tokens to a user
   */
  async distributeTokens(userId: string, tokenType: 'LOVE' | 'LOVE2', amount: number, description: string) {
    // Get current balance from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('love_balance, love2_balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) throw new Error('User not found');

    const currentBalance = tokenType === 'LOVE'
      ? Number(userData.love_balance || 0)
      : Number(userData.love2_balance || 0);
    const newBalance = currentBalance + amount;

    // Update users table
    const updateField = tokenType === 'LOVE'
      ? { love_balance: newBalance }
      : { love2_balance: newBalance };

    const { error: updateError } = await supabase
      .from('users')
      .update(updateField)
      .eq('id', userId);

    if (updateError) throw updateError;

    // Sync to profiles table
    await syncBalancesToProfiles(
      userId,
      tokenType === 'LOVE' ? newBalance : Number(userData.love_balance || 0),
      tokenType === 'LOVE2' ? newBalance : Number(userData.love2_balance || 0)
    );

    // Record transaction
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
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

  /**
   * Get faucet distribution statistics
   */
  async getFaucetStats() {
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

  /**
   * Update user membership tier
   */
  async updateUserMembership(userId: string, membershipTier: 'standard' | 'plus' | 'premium', expiresAt?: string) {
    const updateData: Database['public']['Tables']['users']['Update'] = { membership_tier: membershipTier };

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

    // Update users table
    const { error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (userError) throw userError;

    // Also update profiles table
    await supabase
      .from('profiles')
      .update({
        membership_tier: membershipTier,
        membership_expires_at: updateData.membership_expires_at
      })
      .eq('auth_user_id', userId);

    return { success: true, membership_tier: membershipTier, expires_at: updateData.membership_expires_at };
  },

  /**
   * Get membership statistics
   */
  async getMembershipStats() {
    const { data: users, error } = await supabase
      .from('users')
      .select('membership_tier, membership_expires_at, created_at');

    if (error) throw error;

    const totalUsers = users?.length || 0;
    const standardUsers = users?.filter(u => u.membership_tier === 'standard' || !u.membership_tier).length || 0;
    const plusUsers = users?.filter(u => u.membership_tier === 'plus').length || 0;
    const premiumUsers = users?.filter(u => u.membership_tier === 'premium').length || 0;

    const now = new Date();
    const activePlusUsers = users?.filter(u =>
      u.membership_tier === 'plus' &&
      (!u.membership_expires_at || new Date(u.membership_expires_at) > now)
    ).length || 0;

    const activePremiumUsers = users?.filter(u =>
      u.membership_tier === 'premium' &&
      (!u.membership_expires_at || new Date(u.membership_expires_at) > now)
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

  /**
   * Get treasury balances (sum of all user balances)
   */
  async getTreasuryBalances() {
    const { data: users, error } = await supabase
      .from('users')
      .select('love_balance, love2_balance');

    if (error) throw error;

    const totalLove = users?.reduce((sum, u) => sum + Number(u.love_balance || 0), 0) || 0;
    const totalLove2 = users?.reduce((sum, u) => sum + Number(u.love2_balance || 0), 0) || 0;

    return [
      { token_type: 'LOVE', balance: totalLove },
      { token_type: 'LOVE2', balance: totalLove2 }
    ];
  },

  /**
   * Get fee configuration from app_config
   */
  async getFeeConfig() {
    const { data, error } = await supabase
      .from('app_config')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  /**
   * Update fee configuration
   */
  async updateFeeConfig(key: string, value: string) {
    const { error } = await supabase
      .from('app_config')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  /**
   * Get treasury transaction history
   */
  async getTreasuryTransactions(limit = 50) {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

export default adminApi;
