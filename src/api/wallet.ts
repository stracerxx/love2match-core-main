import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TokenTransaction = Database['public']['Tables']['token_transactions']['Row'];

type Balances = { love_balance: number; love2_balance: number };

export const walletApi = {
  async getBalances(userId: string): Promise<Balances> {
    const { data, error } = await supabase
      .from('profiles')
      .select('love_token_balance, love2_token_balance')
      .eq('auth_user_id', userId)
      .single();

    if (error) throw error;
    return { love_balance: Number(data?.love_token_balance || 0), love2_balance: Number(data?.love2_token_balance || 0) };
  },

  async listTransactions(userId: string, limit = 20): Promise<TokenTransaction[]> {
    // First get the profile ID from the auth_user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (profileError || !profileData) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', profileData.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Simple demo: earn LOVE tokens
  async earnTokens(userId: string, amount: number, tokenType: 'LOVE' = 'LOVE') {
    // First get the profile ID from the auth_user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, love_token_balance, love2_token_balance')
      .eq('auth_user_id', userId)
      .single();
    if (profileError || !profileData) throw new Error('Profile not found');

    const before = tokenType === 'LOVE' ? Number(profileData.love_token_balance || 0) : Number(profileData.love2_token_balance || 0);
    const after = before + Number(amount);

    // update user balance
    const { error: updErr } = await supabase
      .from('profiles')
      .update({ [tokenType === 'LOVE' ? 'love_token_balance' : 'love2_token_balance']: after })
      .eq('id', profileData.id);
    if (updErr) throw updErr;

    // insert transaction
    const { error: insErr } = await supabase.from('token_transactions').insert({
      user_id: profileData.id,
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

  // Simple demo: spend LOVE tokens
  async spendTokens(userId: string, amount: number, tokenType: 'LOVE' = 'LOVE') {
    // First get the profile ID from the auth_user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, love_token_balance, love2_token_balance')
      .eq('auth_user_id', userId)
      .single();
    if (profileError || !profileData) throw new Error('Profile not found');

    const before = tokenType === 'LOVE' ? Number(profileData.love_token_balance || 0) : Number(profileData.love2_token_balance || 0);
    if (before < amount) throw new Error('Insufficient balance');
    const after = before - Number(amount);

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ [tokenType === 'LOVE' ? 'love_token_balance' : 'love2_token_balance']: after })
      .eq('id', profileData.id);
    if (updErr) throw updErr;

    const { error: insErr } = await supabase.from('token_transactions').insert({
      user_id: profileData.id,
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

  async exchangeTokens(userId: string, from: 'love', to: 'love2', amount: number) {
    // First get the profile ID from the auth_user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, love_token_balance, love2_token_balance')
      .eq('auth_user_id', userId)
      .single();
    if (profileError || !profileData) throw new Error('Profile not found');

    const fromBalance = from === 'love' ? Number(profileData.love_token_balance || 0) : Number(profileData.love2_token_balance || 0);
    if (fromBalance < amount) throw new Error('Insufficient LOVE balance');

    const { error: insertErr } = await supabase.from('swap_requests').insert({
      user_id: profileData.id,
      from_token_type: from.toUpperCase(),
      to_token_type: to.toUpperCase(),
      amount,
      status: 'pending',
    });
    if (insertErr) throw insertErr;
  },
};

export default walletApi;
