import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  full_name?: string;
  role?: string;
  bio?: string;
  photos?: string[];
  tags?: string[];
  demographics?: {
    location?: string;
    location_lat?: number | string;
    location_lng?: number | string;
    [key: string]: any;
  };
  love_token_balance?: number;
  love2_token_balance?: number;
  [key: string]: any;
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { profile: data, error };
};
