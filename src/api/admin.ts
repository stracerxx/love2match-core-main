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

    // Get pending conversion requests
    const { count: pendingConversionRequests, error: conversionError } = await supabase
      .from('conversion_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (conversionError) throw conversionError;

    // For now, return simplified analytics
    return {
      total_users: totalUsers || 0,
      total_love_supply,
      total_love2_supply,
      total_love_earned: 0, // Would need transaction data
      total_love_spent: 0, // Would need transaction data
      pending_swap_requests: pendingConversionRequests || 0,
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

  // Get pending conversion requests (LOVE to LOVE2)
  async getPendingExchanges(): Promise<ExchangeRequest[]> {
    const { data, error } = await supabase
      .from('conversion_requests')
      .select(`
        *,
        users!conversion_requests_user_id_fkey(email)
      `)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (error) throw error;

    return data?.map(request => ({
      id: request.id,
      user_id: request.user_id,
      user_email: request.users?.email || 'Unknown',
      from_token: request.from_token,
      to_token: request.to_token,
      amount: Number(request.amount),
      status: request.status,
      created_at: request.requested_at
    })) || [];
  },

  // Approve conversion request
  async approveExchange(requestId: string) {
    const { data: request, error: fetchError } = await supabase
.from('conversion_requests')
    .select('*')
      .eq('id', requestId)
      .single();
      
      if (fetchError) throw fetchError;
if (!request) throw new Error('Conversion request not found');
    
    const { data: user, error: userError } = await supabase
.from('users')
    .select('love_balance, love2_balance')
      .eq('id', request.user_id)
      .single();
      
      if (userError) throw userError;
if (!user) throw new Error('User not found');
    
    const loveBalance = Number(user.love_balance || 0);
const love2Balance = Number(user.love2_balance || 0);
    const amount = Number(request.amount);
    
    if (loveBalance < amount) {
throw new Error('Insufficient LOVE balance');
    }
      
    const newLoveBalance = loveBalance - amount;
const newLove2Balance = love2Balance + amount;
    
    const { error: updateUserError } = await supabase
.from('users')
    .update({
      love_balance: newLoveBalance,
      love2_balance: newLove2Balance
        })
        .eq('id', request.user_id);
      
      if (updateUserError) throw updateUserError;

    const currentUser = await supabase.auth.getUser();
const { error: updateRequestError } = await supabase
    .from('conversion_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser.data.user?.id || null,
        updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (updateRequestError) throw updateRequestError;

    await supabase.from('token_transactions').insert([
{
    user_id: request.user_id,
    type: 'spend',
      token_type: 'LOVE',
        amount: amount,
        balance_before: loveBalance,
        balance_after: newLoveBalance,
        description: `Converted to LOVE2 (Request #${requestId.substring(0, 8)})`
        },
        {
        user_id: request.user_id,
      type: 'earn',
      token_type: 'LOVE2',
        amount: amount,
        balance_before: love2Balance,
        balance_after: newLove2Balance,
        description: `Converted from LOVE (Request #${requestId.substring(0, 8)})`
        }
        ]);
        },
      
    // Reject conversion request
  async rejectExchange(requestId: string) {
const currentUser = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('conversion_requests')
    .update({
status: 'rejected',
    reviewed_at: new Date().toISOString(),
      reviewed_by: currentUser.data.user?.id || null,
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