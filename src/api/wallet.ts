import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TokenTransaction = Database['public']['Tables']['token_transactions']['Row'];

type Balances = { love_balance: number; love2_balance: number; sol_balance?: number };

/**
 * Helper function to sync balances between users and profiles tables
 * This ensures data consistency across both tables
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
    // Non-critical - don't throw, just log
  }
}

export const walletApi = {
  /**
   * Get user balances from the users table (primary source of truth)
   */
  async getBalances(userId: string): Promise<Balances> {
    const { data, error } = await supabase
      .from('users')
      .select('love_balance, love2_balance')
      .eq('id', userId)
      .single();

    if (error) {
      // Fallback to profiles table if users table fails
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('love_token_balance, love2_token_balance')
        .eq('auth_user_id', userId)
        .single();

      if (profileError) throw profileError;
      return {
        love_balance: Number(profileData?.love_token_balance || 0),
        love2_balance: Number(profileData?.love2_token_balance || 0),
        sol_balance: 0
      };
    }

    return {
      love_balance: Number(data?.love_balance || 0),
      love2_balance: Number(data?.love2_balance || 0),
      sol_balance: 0 // Placeholder - would need to fetch from blockchain
    };
  },

  /**
   * List recent transactions for a user
   */
  async listTransactions(userId: string, limit = 20): Promise<TokenTransaction[]> {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Earn LOVE tokens - updates users table and syncs to profiles
   */
  async earnTokens(userId: string, amount: number, tokenType: 'LOVE' | 'LOVE2' = 'LOVE') {
    // Get current balance from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('love_balance, love2_balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) throw new Error('User not found');

    const before = tokenType === 'LOVE'
      ? Number(userData.love_balance || 0)
      : Number(userData.love2_balance || 0);
    const after = before + Number(amount);

    // Update users table (primary)
    const updateField = tokenType === 'LOVE'
      ? { love_balance: after }
      : { love2_balance: after };

    const { error: updErr } = await supabase
      .from('users')
      .update(updateField)
      .eq('id', userId);

    if (updErr) throw updErr;

    // Sync to profiles table
    await syncBalancesToProfiles(
      userId,
      tokenType === 'LOVE' ? after : Number(userData.love_balance || 0),
      tokenType === 'LOVE2' ? after : Number(userData.love2_balance || 0)
    );

    // Insert transaction record
    const { error: insErr } = await supabase.from('token_transactions').insert({
      user_id: userId,
      type: 'earn',
      token_type: tokenType,
      amount,
      balance_before: before,
      balance_after: after,
      description: 'Demo earn',
    });
    if (insErr) throw insErr;

    return { before, after };
  },

  /**
   * Spend LOVE tokens - updates users table and syncs to profiles
   */
  async spendTokens(userId: string, amount: number, tokenType: 'LOVE' | 'LOVE2' = 'LOVE') {
    // Get current balance from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('love_balance, love2_balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) throw new Error('User not found');

    const before = tokenType === 'LOVE'
      ? Number(userData.love_balance || 0)
      : Number(userData.love2_balance || 0);

    if (before < amount) throw new Error('Insufficient balance');
    const after = before - Number(amount);

    // Update users table (primary)
    const updateField = tokenType === 'LOVE'
      ? { love_balance: after }
      : { love2_balance: after };

    const { error: updErr } = await supabase
      .from('users')
      .update(updateField)
      .eq('id', userId);

    if (updErr) throw updErr;

    // Sync to profiles table
    await syncBalancesToProfiles(
      userId,
      tokenType === 'LOVE' ? after : Number(userData.love_balance || 0),
      tokenType === 'LOVE2' ? after : Number(userData.love2_balance || 0)
    );

    // Insert transaction record
    const { error: insErr } = await supabase.from('token_transactions').insert({
      user_id: userId,
      type: 'spend',
      token_type: tokenType,
      amount,
      balance_before: before,
      balance_after: after,
      description: 'Demo spend',
    });
    if (insErr) throw insErr;

    return { before, after };
  },

  /**
   * Exchange LOVE tokens for LOVE2 - creates a pending swap request
   */
  async exchangeTokens(userId: string, from: 'love', to: 'love2', amount: number) {
    // Get current balance from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('love_balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) throw new Error('User not found');

    const fromBalance = Number(userData.love_balance || 0);
    if (fromBalance < amount) throw new Error('Insufficient LOVE balance');

    // Create swap request
    const { error: insertErr } = await supabase.from('swap_requests').insert({
      user_id: userId,
      from_token_type: from.toUpperCase(),
      to_token_type: to.toUpperCase(),
      amount,
      status: 'pending',
    });
    if (insertErr) throw insertErr;
  },
};

export default walletApi;
