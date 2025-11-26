-- Advanced Monetization Migration
-- Adds tiered subscriptions, subscription boxes, and enhanced tipping features

-- =========================
-- CREATOR SUBSCRIPTION TIERS
-- =========================
create table if not exists public.creator_subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  price_love numeric not null,
  duration_type text not null check (duration_type in ('monthly', 'quarterly', 'annual')) default 'monthly',
  access_level integer not null default 1,
  perks jsonb default '[]',
  max_subscribers integer,
  current_subscribers integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for creator subscription tiers
alter table public.creator_subscription_tiers enable row level security;

create policy "creator_subscription_tiers_select_all"
  on public.creator_subscription_tiers for select
  using (true);

create policy "creator_subscription_tiers_insert_own"
  on public.creator_subscription_tiers for insert
  with check (auth.uid() = creator_id);

create policy "creator_subscription_tiers_update_own"
  on public.creator_subscription_tiers for update
  using (auth.uid() = creator_id);

create policy "creator_subscription_tiers_delete_own"
  on public.creator_subscription_tiers for delete
  using (auth.uid() = creator_id);

-- =========================
-- USER SUBSCRIPTIONS TO CREATORS
-- =========================
create table if not exists public.creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references auth.users(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,
  tier_id uuid not null references public.creator_subscription_tiers(id),
  status text not null check (status in ('active', 'canceled', 'expired', 'pending')) default 'active',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  auto_renew boolean default true,
  last_payment_at timestamptz,
  next_payment_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(subscriber_id, creator_id, tier_id)
);

-- RLS for creator subscriptions
alter table public.creator_subscriptions enable row level security;

create policy "creator_subscriptions_select_own"
  on public.creator_subscriptions for select
  using (auth.uid() = subscriber_id or auth.uid() = creator_id);

create policy "creator_subscriptions_insert_own"
  on public.creator_subscriptions for insert
  with check (auth.uid() = subscriber_id);

create policy "creator_subscriptions_update_own"
  on public.creator_subscriptions for update
  using (auth.uid() = subscriber_id or auth.uid() = creator_id);

-- =========================
-- SUBSCRIPTION BOXES
-- =========================
create table if not exists public.subscription_boxes (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null,
  content_items jsonb default '[]',
  thumbnail_url text,
  tier_required text check (tier_required in ('none', 'plus', 'premium', 'vip')) default 'none',
  is_active boolean default true,
  is_limited boolean default false,
  quantity_available integer,
  purchases_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for subscription boxes
alter table public.subscription_boxes enable row level security;

create policy "subscription_boxes_select_all"
  on public.subscription_boxes for select
  using (true);

create policy "subscription_boxes_insert_own"
  on public.subscription_boxes for insert
  with check (auth.uid() = creator_id);

create policy "subscription_boxes_update_own"
  on public.subscription_boxes for update
  using (auth.uid() = creator_id);

create policy "subscription_boxes_delete_own"
  on public.subscription_boxes for delete
  using (auth.uid() = creator_id);

-- =========================
-- BOX PURCHASES
-- =========================
create table if not exists public.box_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  box_id uuid not null references public.subscription_boxes(id),
  price_paid numeric not null,
  purchased_at timestamptz default now(),
  status text not null check (status in ('completed', 'refunded', 'pending')) default 'completed'
);

-- RLS for box purchases
alter table public.box_purchases enable row level security;

create policy "box_purchases_select_own"
  on public.box_purchases for select
  using (auth.uid() = user_id);

create policy "box_purchases_insert_own"
  on public.box_purchases for insert
  with check (auth.uid() = user_id);

-- =========================
-- ENHANCED TIPPING
-- =========================
create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  message text,
  content_id uuid,
  content_type text not null check (content_type in ('profile', 'premium_content', 'live_stream', 'general', 'subscription_box')),
  is_anonymous boolean default false,
  created_at timestamptz default now()
);

-- RLS for tips
alter table public.tips enable row level security;

create policy "tips_select_own"
  on public.tips for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "tips_insert_own"
  on public.tips for insert
  with check (auth.uid() = sender_id);

-- =========================
-- PREMIUM CONTENT
-- =========================
create table if not exists public.premium_content (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  content_url text,
  content_type text not null check (content_type in ('image', 'video', 'audio', 'text', 'bundle')),
  tier_required text check (tier_required in ('none', 'plus', 'premium', 'vip')) default 'none',
  price numeric,
  is_free boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for premium content
alter table public.premium_content enable row level security;

create policy "premium_content_select_all"
  on public.premium_content for select
  using (true);

create policy "premium_content_insert_own"
  on public.premium_content for insert
  with check (auth.uid() = creator_id);

create policy "premium_content_update_own"
  on public.premium_content for update
  using (auth.uid() = creator_id);

create policy "premium_content_delete_own"
  on public.premium_content for delete
  using (auth.uid() = creator_id);

-- =========================
-- CONTENT PURCHASES
-- =========================
create table if not exists public.content_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references public.premium_content(id),
  price_paid numeric,
  purchased_at timestamptz default now()
);

-- RLS for content purchases
alter table public.content_purchases enable row level security;

create policy "content_purchases_select_own"
  on public.content_purchases for select
  using (auth.uid() = user_id);

create policy "content_purchases_insert_own"
  on public.content_purchases for insert
  with check (auth.uid() = user_id);

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================
create index if not exists idx_creator_subscription_tiers_creator_id on public.creator_subscription_tiers(creator_id);
create index if not exists idx_creator_subscription_tiers_active on public.creator_subscription_tiers(is_active);
create index if not exists idx_creator_subscriptions_subscriber_id on public.creator_subscriptions(subscriber_id);
create index if not exists idx_creator_subscriptions_creator_id on public.creator_subscriptions(creator_id);
create index if not exists idx_creator_subscriptions_status on public.creator_subscriptions(status);
create index if not exists idx_subscription_boxes_creator_id on public.subscription_boxes(creator_id);
create index if not exists idx_subscription_boxes_active on public.subscription_boxes(is_active);
create index if not exists idx_box_purchases_user_id on public.box_purchases(user_id);
create index if not exists idx_box_purchases_box_id on public.box_purchases(box_id);
create index if not exists idx_tips_sender_id on public.tips(sender_id);
create index if not exists idx_tips_receiver_id on public.tips(receiver_id);
create index if not exists idx_tips_created_at on public.tips(created_at);
create index if not exists idx_premium_content_creator_id on public.premium_content(creator_id);
create index if not exists idx_premium_content_active on public.premium_content(is_active);
create index if not exists idx_content_purchases_user_id on public.content_purchases(user_id);
create index if not exists idx_content_purchases_content_id on public.content_purchases(content_id);

-- =========================
-- GRANT PERMISSIONS
-- =========================
grant all on public.creator_subscription_tiers to authenticated;
grant all on public.creator_subscriptions to authenticated;
grant all on public.subscription_boxes to authenticated;
grant all on public.box_purchases to authenticated;
grant all on public.tips to authenticated;
grant all on public.premium_content to authenticated;
grant all on public.content_purchases to authenticated;

-- =========================
-- SAMPLE DATA
-- =========================
-- Insert sample creator subscription tiers
insert into public.creator_subscription_tiers (creator_id, name, description, price_love, duration_type, access_level, perks, max_subscribers) 
select 
  id as creator_id,
  'Basic Fan' as name,
  'Access to exclusive posts and basic content' as description,
  49 as price_love,
  'monthly' as duration_type,
  1 as access_level,
  '["exclusive_posts", "basic_content"]'::jsonb as perks,
  1000 as max_subscribers
from auth.users 
where email = 'creator@example.com'
limit 1;

insert into public.creator_subscription_tiers (creator_id, name, description, price_love, duration_type, access_level, perks, max_subscribers) 
select 
  id as creator_id,
  'Premium Access' as name,
  'Full access to all premium content and early releases' as description,
  149 as price_love,
  'monthly' as duration_type,
  2 as access_level,
  '["all_content", "early_access", "direct_messaging"]'::jsonb as perks,
  500 as max_subscribers
from auth.users 
where email = 'creator@example.com'
limit 1;

insert into public.creator_subscription_tiers (creator_id, name, description, price_love, duration_type, access_level, perks, max_subscribers) 
select 
  id as creator_id,
  'VIP Elite' as name,
  'VIP treatment with personalized content and priority access' as description,
  299 as price_love,
  'monthly' as duration_type,
  3 as access_level,
  '["personalized_content", "priority_support", "exclusive_events", "one_on_one_calls"]'::jsonb as perks,
  100 as max_subscribers
from auth.users 
where email = 'creator@example.com'
limit 1;

-- Insert sample subscription box
insert into public.subscription_boxes (creator_id, name, description, price, content_items, tier_required) 
select 
  id as creator_id,
  'Monthly Romance Bundle' as name,
  'Curated collection of romantic stories, poems, and exclusive photos' as description,
  199 as price,
  '[
    {"content_id": "story-001", "content_type": "text", "title": "Midnight Confessions"},
    {"content_id": "photo-001", "content_type": "image", "title": "Sunset Romance"},
    {"content_id": "audio-001", "content_type": "audio", "title": "Love Letters"}
  ]'::jsonb as content_items,
  'none' as tier_required
from auth.users 
where email = 'creator@example.com'
limit 1;

-- Insert sample premium content
insert into public.premium_content (creator_id, title, description, content_type, tier_required, price) 
select 
  id as creator_id,
  'Exclusive Beach Photos' as title,
  'Beautiful beach photography from my recent vacation' as description,
  'image' as content_type,
  'plus' as tier_required,
  99 as price
from auth.users 
where email = 'creator@example.com'
limit 1;