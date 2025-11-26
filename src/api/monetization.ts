import { supabase } from '@/integrations/supabase/client';

// =========================
// CREATOR SUBSCRIPTION TIERS
// =========================

export interface CreatorSubscriptionTier {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  price_love: number;
  duration_type: 'monthly' | 'quarterly' | 'annual';
  access_level: number;
  perks: string[];
  max_subscribers?: number;
  current_subscribers: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionTierData {
  name: string;
  description?: string;
  price_love: number;
  duration_type: 'monthly' | 'quarterly' | 'annual';
  access_level: number;
  perks: string[];
  max_subscribers?: number;
}

export async function createSubscriptionTier(data: CreateSubscriptionTierData) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data: tier, error } = await supabase
    .from('creator_subscription_tiers')
    .insert({
      creator_id: userData.user.id,
      ...data,
      perks: data.perks || [],
      current_subscribers: 0,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return tier;
}

export async function getCreatorSubscriptionTiers(creatorId?: string) {
  let query = supabase
    .from('creator_subscription_tiers')
    .select('*')
    .eq('is_active', true);

  if (creatorId) {
    query = query.eq('creator_id', creatorId);
  }

  const { data, error } = await query.order('access_level', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateSubscriptionTier(tierId: string, updates: Partial<CreatorSubscriptionTier>) {
  const { data, error } = await supabase
    .from('creator_subscription_tiers')
    .update(updates)
    .eq('id', tierId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =========================
// USER SUBSCRIPTIONS TO CREATORS
// =========================

export interface CreatorSubscription {
  id: string;
  subscriber_id: string;
  creator_id: string;
  tier_id: string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  starts_at: string;
  ends_at: string;
  auto_renew: boolean;
  last_payment_at?: string;
  next_payment_at?: string;
  created_at: string;
  updated_at: string;
}

export async function subscribeToCreator(tierId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  // Get tier details
  const { data: tier, error: tierError } = await supabase
    .from('creator_subscription_tiers')
    .select('*')
    .eq('id', tierId)
    .single();

  if (tierError) throw tierError;

  // Calculate subscription dates
  const startsAt = new Date().toISOString();
  const endsAt = calculateSubscriptionEndDate(startsAt, tier.duration_type);

  const { data: subscription, error } = await supabase
    .from('creator_subscriptions')
    .insert({
      subscriber_id: userData.user.id,
      creator_id: tier.creator_id,
      tier_id: tierId,
      status: 'active',
      starts_at: startsAt,
      ends_at: endsAt,
      auto_renew: true
    })
    .select(`
      *,
      creator_subscription_tiers (*)
    `)
    .single();

  if (error) throw error;

  // Update subscriber count
  await supabase
    .from('creator_subscription_tiers')
    .update({ current_subscribers: tier.current_subscribers + 1 })
    .eq('id', tierId);

  return subscription;
}

export async function getUserSubscriptions() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('creator_subscriptions')
    .select(`
      *,
      creator_subscription_tiers (*),
      creator:users!creator_subscriptions_creator_id_fkey (id, email, raw_user_meta_data)
    `)
    .eq('subscriber_id', userData.user.id)
    .eq('status', 'active');

  if (error) throw error;
  return data;
}

export async function cancelSubscription(subscriptionId: string) {
  const { data, error } = await supabase
    .from('creator_subscriptions')
    .update({ 
      status: 'canceled',
      auto_renew: false 
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =========================
// SUBSCRIPTION BOXES
// =========================

export interface SubscriptionBox {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  price: number;
  content_items: Array<{
    content_id: string;
    content_type: string;
    title: string;
    preview_url?: string;
  }>;
  thumbnail_url?: string;
  tier_required: 'none' | 'plus' | 'premium' | 'vip';
  is_active: boolean;
  is_limited: boolean;
  quantity_available?: number;
  purchases_count: number;
  created_at: string;
  updated_at: string;
}

export async function createSubscriptionBox(data: Omit<SubscriptionBox, 'id' | 'creator_id' | 'created_at' | 'updated_at'>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data: box, error } = await supabase
    .from('subscription_boxes')
    .insert({
      creator_id: userData.user.id,
      ...data,
      purchases_count: 0
    })
    .select()
    .single();

  if (error) throw error;
  return box;
}

export async function getSubscriptionBoxes(creatorId?: string) {
  let query = supabase
    .from('subscription_boxes')
    .select('*')
    .eq('is_active', true);

  if (creatorId) {
    query = query.eq('creator_id', creatorId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function purchaseSubscriptionBox(boxId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  // Get box details
  const { data: box, error: boxError } = await supabase
    .from('subscription_boxes')
    .select('*')
    .eq('id', boxId)
    .single();

  if (boxError) throw boxError;

  // Check if limited and available
  if (box.is_limited && box.quantity_available !== null && box.quantity_available <= 0) {
    throw new Error('Box is sold out');
  }

  const { data: purchase, error } = await supabase
    .from('box_purchases')
    .insert({
      user_id: userData.user.id,
      box_id: boxId,
      price_paid: box.price,
      status: 'completed'
    })
    .select(`
      *,
      subscription_boxes (*)
    `)
    .single();

  if (error) throw error;

  // Update purchase count and quantity
  await supabase
    .from('subscription_boxes')
    .update({
      purchases_count: box.purchases_count + 1,
      ...(box.is_limited && box.quantity_available !== null && {
        quantity_available: box.quantity_available - 1
      })
    })
    .eq('id', boxId);

  return purchase;
}

// =========================
// TIPPING FUNCTIONALITY
// =========================

export interface Tip {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  message?: string;
  content_id?: string;
  content_type: 'profile' | 'premium_content' | 'live_stream' | 'general' | 'subscription_box';
  is_anonymous: boolean;
  created_at: string;
}

export async function sendTip(data: {
  receiver_id: string;
  amount: number;
  message?: string;
  content_id?: string;
  content_type: Tip['content_type'];
  is_anonymous?: boolean;
}) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data: tip, error } = await supabase
    .from('tips')
    .insert({
      sender_id: userData.user.id,
      ...data,
      is_anonymous: data.is_anonymous || false
    })
    .select(`
      *,
      sender:users!tips_sender_id_fkey (id, email, raw_user_meta_data),
      receiver:users!tips_receiver_id_fkey (id, email, raw_user_meta_data)
    `)
    .single();

  if (error) throw error;
  return tip;
}

export async function getUserTips() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('tips')
    .select(`
      *,
      sender:users!tips_sender_id_fkey (id, email, raw_user_meta_data),
      receiver:users!tips_receiver_id_fkey (id, email, raw_user_meta_data)
    `)
    .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// =========================
// HELPER FUNCTIONS
// =========================

function calculateSubscriptionEndDate(startDate: string, durationType: string): string {
  const start = new Date(startDate);
  let end = new Date(start);

  switch (durationType) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'quarterly':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'annual':
      end.setFullYear(end.getFullYear() + 1);
      break;
    default:
      end.setMonth(end.getMonth() + 1);
  }

  return end.toISOString();
}

export async function checkUserSubscription(creatorId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data, error } = await supabase
    .from('creator_subscriptions')
    .select('id')
    .eq('subscriber_id', userData.user.id)
    .eq('creator_id', creatorId)
    .eq('status', 'active')
    .single();

  return !error && data !== null;
}