-- Token Transactions Migration - Part 2
-- Enhanced token transactions and creator verification

-- =========================
-- ENHANCED TOKEN TRANSACTIONS
-- =========================
-- Drop and recreate with proper schema
drop table if exists public.token_transactions cascade;

create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('earn','spend','swap','transfer','purchase','refund','gift','tip','subscription','adjust')),
  token_type text not null check (token_type in ('LOVE','LOVE2')),
  amount numeric not null,
  balance_before numeric,
  balance_after numeric,
  description text,
  related_entity_type text,
  related_entity_id uuid,
  swap_request_id uuid references public.swap_requests(id),
  created_at timestamptz default now()
);

alter table public.token_transactions enable row level security;

-- RLS: Users can see their own transactions
create policy "token_transactions_select_own"
  on public.token_transactions for select
  using (auth.uid() = user_id);

create policy "token_transactions_insert_own"
  on public.token_transactions for insert
  with check (auth.uid() = user_id);

-- Admins can see all transactions
create policy "token_transactions_select_admin"
  on public.token_transactions for select
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- =========================
-- CREATOR VERIFICATION
-- =========================
create table if not exists public.creator_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  id_document_url text,
  selfie_verification_url text,
  bio text,
  social_media_links jsonb,
  portfolio_links jsonb,
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.creator_verification_requests enable row level security;

-- RLS: Users can see their own verification requests
create policy "creator_verification_select_own"
  on public.creator_verification_requests for select
  using (auth.uid() = user_id);

create policy "creator_verification_insert_own"
  on public.creator_verification_requests for insert
  with check (auth.uid() = user_id);

-- Admins can see all verification requests
create policy "creator_verification_select_admin"
  on public.creator_verification_requests for select
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "creator_verification_update_admin"
  on public.creator_verification_requests for update
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Grant permissions
grant all on public.token_transactions to authenticated;
grant all on public.creator_verification_requests to authenticated;