// LiquidityLock.ts - Guarding LOVE2 release
import { supabase } from './supabase';

export const checkLiquidityReserve = async (requiredRatio: number) => {
  const { data: reserve, error } = await supabase
    .from('treasury')
    .select('love_balance, love2_balance')
    .single();

  if (error || !reserve) return false;
  
  // Prevent LOVE2 activation if LOVE reserve is below threshold
  const reserveRatio = reserve.love_balance > 0 ? reserve.love2_balance / reserve.love_balance : 0;
  return reserveRatio >= requiredRatio;
};
