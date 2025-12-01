-- Treasury Migration
-- Adds treasury table for admin master wallets and fee collection

-- =========================
-- TREASURY TABLE
-- =========================
create table if not exists public.treasury (
  id uuid primary key default gen_random_uuid(),
  token_type text not null check (token_type in ('LOVE', 'LOVE2', 'SOL')),
  balance numeric not null default 0,
  description text,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(token_type)
);

-- Insert initial treasury balances (zero)
insert into public.treasury (token_type, balance, description) values
  ('LOVE', 0, 'Platform LOVE token treasury'),
  ('LOVE2', 0, 'Platform LOVE2 token treasury'),
  ('SOL', 0, 'Platform SOL treasury for gas fees')
on conflict (token_type) do update set
  balance = excluded.balance,
  updated_at = now();

-- =========================
-- TREASURY TRANSACTIONS (optional for auditing)
-- =========================
create table if not exists public.treasury_transactions (
  id uuid primary key default gen_random_uuid(),
  treasury_id uuid not null references public.treasury(id) on delete cascade,
  amount numeric not null,
  balance_before numeric not null,
  balance_after numeric not null,
  transaction_type text not null check (transaction_type in ('fee', 'swap', 'bridge', 'withdrawal', 'deposit', 'adjustment')),
  related_entity_type text,
  related_entity_id uuid,
  description text,
  created_at timestamptz default now()
);

-- =========================
-- FEE CONFIGURATION
-- =========================
-- Add fee configuration to app_config
insert into public.app_config (key, value, description) values
  ('swap_fee_percent', '1', 'Percentage fee for LOVE to LOVE2 swaps (1 = 1%)'),
  ('bridge_fee_fixed', '0.1', 'Fixed LOVE2 fee for bridging to Solana'),
  ('withdrawal_fee_percent', '0.5', 'Percentage fee for LOVE2 withdrawals to external wallets')
on conflict (key) do nothing;

-- =========================
-- RLS POLICIES
-- =========================
alter table public.treasury enable row level security;
alter table public.treasury_transactions enable row level security;

-- Only admins can view treasury
create policy "treasury_select_admin"
  on public.treasury for select
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "treasury_update_admin"
  on public.treasury for update
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Only admins can view treasury transactions
create policy "treasury_transactions_select_admin"
  on public.treasury_transactions for select
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

create policy "treasury_transactions_insert_admin"
  on public.treasury_transactions for insert
  with check (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- =========================
-- GRANT PERMISSIONS
-- =========================
grant all on public.treasury to authenticated;
grant all on public.treasury_transactions to authenticated;

-- =========================
-- FUNCTION TO UPDATE TREASURY BALANCE
-- =========================
create or replace function public.update_treasury_balance(
  p_token_type text,
  p_amount numeric,
  p_transaction_type text default 'adjustment',
  p_description text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_treasury_id uuid;
  v_balance_before numeric;
  v_balance_after numeric;
begin
  -- Verify admin (optional, but we'll enforce via RLS)
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can update treasury';
  end if;

  -- Get treasury record
  select id, balance into v_treasury_id, v_balance_before
  from public.treasury
  where token_type = p_token_type
  for update;

  if v_treasury_id is null then
    raise exception 'Treasury record for token type % not found', p_token_type;
  end if;

  -- Calculate new balance
  v_balance_after := v_balance_before + p_amount;

  -- Update treasury
  update public.treasury
  set balance = v_balance_after,
      updated_at = now()
  where id = v_treasury_id;

  -- Record transaction
  insert into public.treasury_transactions (
    treasury_id,
    amount,
    balance_before,
    balance_after,
    transaction_type,
    description
  ) values (
    v_treasury_id,
    p_amount,
    v_balance_before,
    v_balance_after,
    p_transaction_type,
    p_description
  );
end;
$$;

revoke all on function public.update_treasury_balance(text, numeric, text, text) from public;
grant execute on function public.update_treasury_balance(text, numeric, text, text) to authenticated;