import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TokenTransaction = Database['public']['Tables']['token_transactions']['Row'];

type Balances = { love_balance: number; love2_balance: number };

export const walletApi = {
  async getBalances(userId: string): Promise<Balances> {
    const { data, error } = await supabase
      .from('users')
      .select('love_balance, love2_balance')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { love_balance: Number(data?.love_balance || 0), love2_balance: Number(data?.love2_balance || 0) };
  },

  async listTransactions(userId: string, limit = 20): Promise<TokenTransaction[]> {
    const userIdNum = Number(userId);
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userIdNum)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Simple demo: earn LOVE tokens
  async earnTokens(userId: string, amount: number, tokenType: 'LOVE' | 'LOVE2' = 'LOVE') {
    // Read current balance
    const { data: user, error: getErr } = await supabase
      .from('users')
      .select('love_balance, love2_balance')
      .eq('id', userId)
      .single();
    if (getErr) throw getErr;

    const before = tokenType === 'LOVE' ? Number(user?.love_balance || 0) : Number(user?.love2_balance || 0);
    const after = before + Number(amount);

    // update user balance
    const { error: updErr } = await supabase
      .from('users')
      .update({ [tokenType === 'LOVE' ? 'love_balance' : 'love2_balance']: after })
      .eq('id', userId);
    if (updErr) throw updErr;

    // insert transaction
    const userIdNum = Number(userId);
    const { error: insErr } = await supabase.from('token_transactions').insert({
      user_id: userIdNum,
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
  async spendTokens(userId: string, amount: number, tokenType: 'LOVE' | 'LOVE2' = 'LOVE') {
    const { data: user, error: getErr } = await supabase
      .from('users')
      .select('love_balance, love2_balance')
      .eq('id', userId)
      .single();
    if (getErr) throw getErr;

    const before = tokenType === 'LOVE' ? Number(user?.love_balance || 0) : Number(user?.love2_balance || 0);
    if (before < amount) throw new Error('Insufficient balance');
    const after = before - Number(amount);

    const { error: updErr } = await supabase
      .from('users')
      .update({ [tokenType === 'LOVE' ? 'love_balance' : 'love2_balance']: after })
      .eq('id', userId);
    if (updErr) throw updErr;

    const userIdNum = Number(userId);
    const { error: insErr } = await supabase.from('token_transactions').insert({
      user_id: userIdNum,
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
};

export default walletApi;
