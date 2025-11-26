import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AuthError = {
  message: string;
  status?: number;
};

export const signUp = async (email: string, password: string, displayName: string) => {
  const redirectUrl = `${window.location.origin}/`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        display_name: displayName,
        full_name: displayName,
      },
    },
  });

  if (error) {
    return { error: { message: error.message, status: error.status } as AuthError };
  }

  // Create user profile in database
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        display_name: displayName,
        full_name: displayName,
        bio: '',
        is_suspended: false,
        membership_tier: 'free',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }

  return { data, error: null };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: { message: error.message, status: error.status } as AuthError };
  }

  return { data, error: null };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { error: { message: error.message } as AuthError };
  }

  return { error: null };
};

export const getCurrentUser = async (): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: { message: error.message } };
  }

  return { user, error: null };
};

export const getSession = async (): Promise<{ session: Session | null; error: AuthError | null }> => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    return { session: null, error: { message: error.message } };
  }

  return { session, error: null };
};
