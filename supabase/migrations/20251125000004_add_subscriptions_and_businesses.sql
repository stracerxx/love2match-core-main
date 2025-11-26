-- Subscriptions and Businesses Migration - Part 4
-- Subscription tiers, user subscriptions, and businesses

-- =========================
-- SUBSCRIPTIONS
-- =========================
create table if not exists public.subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_love_monthly numeric not null,
  features jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier_id uuid not null references public.subscription_tiers(id),
  status text not null check (status in ('active','canceled','expired')) default 'active',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_subscriptions enable row level security;

-- RLS: Users can see their own subscriptions
create policy "user_subscriptions_select_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- =========================
-- BUSINESSES
-- =========================
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  phone text,
  email text,
  website_url text,
  accepts_love_tokens boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- ENHANCED USER FIELDS
-- =========================
-- Add missing user fields
alter table if exists public.users
  add column if not exists membership_tier text default 'basic',
  add column if not exists creator_verified boolean default false,
  add column if not exists is_suspended boolean default false,
  add column if not exists solana_wallet_address text,
  add column if not exists daily_swap_limit numeric default 1000,
  add column if not exists referral_code text unique,
  add column if not exists age_verified boolean default false;

-- Generate referral codes for existing users
update public.users 
set referral_code = encode(gen_random_bytes(8), 'hex')
where referral_code is null;

-- Insert sample subscription tiers
insert into public.subscription_tiers (name, description, price_love_monthly, features, is_active) values
  ('Plus', 'Enhanced features and visibility', 99, '["advanced_filters", "see_who_liked_you", "priority_matching"]', true),
  ('Premium', 'Full access to all features', 199, '["all_plus_features", "unlimited_likes", "profile_boosts"]', true);

-- Insert sample businesses
insert into public.businesses (name, description, address, accepts_love_tokens, is_active) values
  ('Romantic Restaurant', 'Fine dining with a romantic atmosphere', '123 Love Street, City', true, true),
  ('Flower Shop', 'Beautiful bouquets for special occasions', '456 Flower Ave, City', true, true),
  ('Jewelry Store', 'Fine jewelry and engagement rings', '789 Diamond Blvd, City', true, true);

-- Grant permissions
grant all on public.subscription_tiers to authenticated;
grant all on public.user_subscriptions to authenticated;
grant all on public.businesses to authenticated;