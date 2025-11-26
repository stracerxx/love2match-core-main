-- Content and Gifts Migration - Part 3
-- Premium content, gifts, and referrals

-- =========================
-- PREMIUM CONTENT
-- =========================
create table if not exists public.premium_content (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  content_url text not null,
  content_type text not null check (content_type in ('image','video')),
  price_love numeric not null check (price_love >= 0),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.premium_content enable row level security;

-- RLS: Creators can manage their own content
create policy "premium_content_select_own"
  on public.premium_content for select
  using (auth.uid() = creator_id);

create policy "premium_content_insert_own"
  on public.premium_content for insert
  with check (auth.uid() = creator_id);

create policy "premium_content_update_own"
  on public.premium_content for update
  using (auth.uid() = creator_id);

-- Users can see active premium content
create policy "premium_content_select_active"
  on public.premium_content for select
  using (is_active = true);

-- =========================
-- CONTENT PURCHASES
-- =========================
create table if not exists public.content_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references public.premium_content(id) on delete cascade,
  amount_paid numeric not null,
  created_at timestamptz default now(),
  unique (user_id, content_id)
);

alter table public.content_purchases enable row level security;

-- RLS: Users can see their own purchases
create policy "content_purchases_select_own"
  on public.content_purchases for select
  using (auth.uid() = user_id);

create policy "content_purchases_insert_own"
  on public.content_purchases for insert
  with check (auth.uid() = user_id);

-- =========================
-- GIFTS
-- =========================
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  price_love numeric not null check (price_love > 0),
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.gift_transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  gift_id uuid not null references public.gifts(id),
  message text,
  created_at timestamptz default now()
);

alter table public.gift_transactions enable row level security;

-- RLS: Users can see gifts they sent or received
create policy "gift_transactions_select_own"
  on public.gift_transactions for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "gift_transactions_insert_own"
  on public.gift_transactions for insert
  with check (auth.uid() = sender_id);

-- =========================
-- REFERRALS
-- =========================
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_email text not null,
  referral_code text not null unique,
  status text not null check (status in ('pending','completed','expired')) default 'pending',
  bonus_awarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.referrals enable row level security;

-- RLS: Users can see their own referrals
create policy "referrals_select_own"
  on public.referrals for select
  using (auth.uid() = referrer_id);

create policy "referrals_insert_own"
  on public.referrals for insert
  with check (auth.uid() = referrer_id);

-- Insert sample gift data
insert into public.gifts (name, description, price_love, is_active) values
  ('Virtual Rose', 'Send a beautiful virtual rose', 10, true),
  ('Love Heart', 'A sparkling heart of love', 25, true),
  ('Diamond Ring', 'Virtual diamond engagement ring', 100, true),
  ('Champagne', 'Celebrate with virtual champagne', 50, true);

-- Grant permissions
grant all on public.premium_content to authenticated;
grant all on public.content_purchases to authenticated;
grant all on public.gifts to authenticated;
grant all on public.gift_transactions to authenticated;
grant all on public.referrals to authenticated;