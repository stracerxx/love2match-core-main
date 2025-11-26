import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['users']['Row'];
type SwapRequest = Database['public']['Tables']['swap_requests']['Row'];
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
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (usersError) throw usersError;

    // Get total LOVE supply
    const { data: loveData, error: loveError } = await supabase
      .from('users')
      .select('love_balance');
    if (loveError) throw loveError;
    const total_love_supply = loveData?.reduce((sum, user) => sum + (user.love_balance || 0), 0) || 0;

    // Get total LOVE2 supply
    const { data: love2Data, error: love2Error } = await supabase
      .from('users')
      .select('love2_balance');
    if (love2Error) throw love2Error;
    const total_love2_supply = love2Data?.reduce((sum, user) => sum + (user.love2_balance || 0), 0) || 0;

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

  // Get all users
  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update user role using direct update
  async updateUserRole(userId: string, newRole: string) {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
  },

  // Get pending swap requests
  async getPendingExchanges(): Promise<ExchangeRequest[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Transform data to match expected format
    return data?.map(request => ({
      id: request.id,
      user_id: request.user_id,
      user_email: 'User', // We'll need to join with users table for email
      from_token: 'LOVE',
      to_token: 'LOVE2',
      amount: request.love_amount,
      status: request.status,
      created_at: request.created_at
    })) || [];
  },

  // Approve exchange using direct update
  async approveExchange(requestId: string) {
    const { error } = await supabase
      .from('swap_requests')
      .update({ 
        status: 'approved',
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  },

  // Reject exchange using direct update
  async rejectExchange(requestId: string) {
    const { error } = await supabase
      .from('swap_requests')
      .update({ 
        status: 'rejected',
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  },

  // Get user statistics
  async getUserStats() {
    const { data, error } = await supabase
      .from('users')
      .select('role, created_date')
      .order('created_date', { ascending: false });

    if (error) throw error;

    const totalUsers = data?.length || 0;
    const adminUsers = data?.filter(user => user.role === 'admin').length || 0;
    const memberUsers = data?.filter(user => user.role === 'member').length || 0;
    
    // Calculate new users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = data?.filter(user => new Date(user.created_date) > sevenDaysAgo).length || 0;

    return {
      totalUsers,
      adminUsers,
      memberUsers,
      newUsers
    };
  }
};

export default adminApi;