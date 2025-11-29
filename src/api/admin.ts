import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = {
  id: number;
  auth_user_id: string;
  email: string;
  role: string;
  created_date: string;
  love_token_balance?: number;
  love2_token_balance?: number;
  membership_tier?: string;
  membership_expires_at?: string;
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
  id: number;
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

    // Get total LOVE supply from profiles
    const { data: loveData, error: loveError } = await supabase
      .from('profiles')
      .select('love_token_balance');
    if (loveError) throw loveError;
    const total_love_supply = loveData?.reduce((sum, profile) => sum + (profile.love_token_balance || 0), 0) || 0;

    // Get total LOVE2 supply from profiles
    const { data: love2Data, error: love2Error } = await supabase
      .from('profiles')
      .select('love2_token_balance');
    if (love2Error) throw love2Error;
    const total_love2_supply = love2Data?.reduce((sum, profile) => sum + (profile.love2_token_balance || 0), 0) || 0;

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
    // Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Get users data separately
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) throw usersError;

    // Combine the data
    return profiles?.map(profile => {
      const user = users?.find(u => u.id === profile.auth_user_id);
      return {
        id: profile.id,
        auth_user_id: profile.auth_user_id,
        email: user?.email || 'Unknown',
        role: user?.role || 'member',
        created_date: user?.created_date || profile.created_at,
        love_token_balance: profile.love_token_balance,
        love2_token_balance: profile.love2_token_balance,
        membership_tier: profile.membership_tier,
        membership_expires_at: profile.membership_expires_at
      };
    }) || [];
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

  // Approve swap request
  async approveExchange(requestId: string) {
    const { data: request, error: fetchError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', Number(requestId))
      .single();
      
    if (fetchError) throw fetchError;
    if (!request) throw new Error('Swap request not found');
    
    // Get the profile for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, love_token_balance, love2_token_balance')
      .eq('id', request.user_id)
      .single();
      
    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');
    
    const loveBalance = Number(profile.love_token_balance || 0);
    const love2Balance = Number(profile.love2_token_balance || 0);
    const amount = Number(request.amount);
    
    if (loveBalance < amount) {
      throw new Error('Insufficient LOVE balance');
    }
      
    const newLoveBalance = loveBalance - amount;
    const newLove2Balance = love2Balance + amount;
    
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        love_token_balance: newLoveBalance,
        love2_token_balance: newLove2Balance
      })
      .eq('id', profile.id);
      
    if (updateProfileError) throw updateProfileError;

    const { error: updateRequestError } = await supabase
      .from('swap_requests')
      .update({
        status: 'completed',
        resulting_amount: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', Number(requestId));
      
    if (updateRequestError) throw updateRequestError;

    await supabase.from('token_transactions').insert([
      {
        user_id: profile.id,
        type: 'exchange_out',
        token_type: 'LOVE',
        amount: amount,
        balance_before: loveBalance,
        balance_after: newLoveBalance,
        description: `Converted to LOVE2 (Request #${requestId.substring(0, 8)})`
      },
      {
        user_id: profile.id,
        type: 'exchange_in',
        token_type: 'LOVE2',
        amount: amount,
        balance_before: love2Balance,
        balance_after: newLove2Balance,
        description: `Converted from LOVE (Request #${requestId.substring(0, 8)})`
      }
    ]);
  },

  // Reject swap request
  async rejectExchange(requestId: string) {
    const { error } = await supabase
      .from('swap_requests')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', Number(requestId));
        
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, love_token_balance, love2_token_balance')
      .eq('auth_user_id', userId)
      .single();
    
    if (profileError) throw profileError;
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
        user_id: profile.id,
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
  }
};

export default adminApi;