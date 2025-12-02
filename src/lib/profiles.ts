import { supabase } from '@/integrations/supabase/client';
import type { UserProfile } from './supabase';

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { profile: null, error: { message: error.message } };
  }

  return { profile: data as UserProfile, error: null };
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { profile: null, error: { message: error.message } };
  }

  return { profile: data as UserProfile, error: null };
};

export const getDiscoverProfiles = async (currentUserId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .neq('id', currentUserId)
    .eq('is_suspended', false)
    .order('last_active', { ascending: false })
    .limit(limit);
  
  if (error) {
    return { profiles: [], error: { message: error.message } };
  }

  return { profiles: data as UserProfile[], error: null };
};
