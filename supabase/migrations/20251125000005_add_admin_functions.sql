-- Admin Functions Migration - Part 5
-- Admin functions and analytics

-- =========================
-- ADMIN FUNCTIONS
-- =========================
-- Function to get platform analytics
create or replace function public.get_platform_analytics()
returns table (
  total_users bigint,
  total_love_supply numeric,
  total_love2_supply numeric,
  total_love_earned numeric,
  total_love_spent numeric,
  pending_swap_requests bigint,
  pending_verifications bigint
)
language sql
security definer
set search_path = public
as $$
  select 
    (select count(*) from public.users) as total_users,
    (select coalesce(sum(love_balance), 0) from public.users) as total_love_supply,
    (select coalesce(sum(love2_balance), 0) from public.users) as total_love2_supply,
    (select coalesce(sum(amount), 0) from public.token_transactions where type = 'earn' and token_type = 'LOVE') as total_love_earned,
    (select coalesce(sum(amount), 0) from public.token_transactions where type = 'spend' and token_type = 'LOVE') as total_love_spent,
    (select count(*) from public.swap_requests where status = 'pending') as pending_swap_requests,
    (select count(*) from public.creator_verification_requests where status = 'pending') as pending_verifications
$$;

revoke all on function public.get_platform_analytics() from public;
grant execute on function public.get_platform_analytics() to authenticated;

-- Function to process swap requests
create or replace function public.process_swap_request(
  p_swap_request_id uuid,
  p_action text,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_swap_request public.swap_requests;
  v_admin_id uuid;
begin
  -- Verify admin
  select id into v_admin_id 
  from public.users 
  where id = auth.uid() and role = 'admin';
  
  if v_admin_id is null then
    raise exception 'Only admins can process swap requests';
  end if;

  -- Get swap request
  select * into v_swap_request
  from public.swap_requests
  where id = p_swap_request_id;
  
  if v_swap_request is null then
    raise exception 'Swap request not found';
  end if;

  if p_action = 'approve' then
    -- Update swap request status
    update public.swap_requests
    set status = 'approved',
        approved_by = v_admin_id,
        admin_notes = p_admin_notes,
        updated_at = now()
    where id = p_swap_request_id;
    
    -- TODO: Implement actual Solana swap logic here
    -- This would involve:
    -- 1. Debit user's LOVE balance
    -- 2. Transfer LOVE2 tokens from treasury to user's wallet
    -- 3. Record token transactions
    -- 4. Update swap request as completed
    
  elsif p_action = 'reject' then
    update public.swap_requests
    set status = 'rejected',
        approved_by = v_admin_id,
        admin_notes = p_admin_notes,
        updated_at = now()
    where id = p_swap_request_id;
  else
    raise exception 'Invalid action. Use "approve" or "reject"';
  end if;
end;
$$;

revoke all on function public.process_swap_request(uuid, text, text) from public;
grant execute on function public.process_swap_request(uuid, text, text) to authenticated;

-- Function to bulk process swap requests
create or replace function public.bulk_process_swap_requests(
  p_swap_request_ids uuid[],
  p_action text,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_swap_request_id uuid;
begin
  -- Verify admin
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can bulk process swap requests';
  end if;

  foreach v_swap_request_id in array p_swap_request_ids
  loop
    perform public.process_swap_request(v_swap_request_id, p_action, p_admin_notes);
  end loop;
end;
$$;

revoke all on function public.bulk_process_swap_requests(uuid[], text, text) from public;
grant execute on function public.bulk_process_swap_requests(uuid[], text, text) to authenticated;

-- Function to update user role
create or replace function public.update_user_role(
  p_user_id uuid,
  p_new_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify admin
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can update user roles';
  end if;

  -- Update user role
  update public.users
  set role = p_new_role,
      updated_at = now()
  where id = p_user_id;
end;
$$;

revoke all on function public.update_user_role(uuid, text) from public;
grant execute on function public.update_user_role(uuid, text) to authenticated;

-- Function to adjust user token balance
create or replace function public.adjust_user_balance(
  p_user_id uuid,
  p_token_type text,
  p_amount numeric,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance numeric;
  v_new_balance numeric;
begin
  -- Verify admin
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Only admins can adjust user balances';
  end if;

  -- Get current balance
  if p_token_type = 'LOVE' then
    select love_balance into v_current_balance from public.users where id = p_user_id;
  elsif p_token_type = 'LOVE2' then
    select love2_balance into v_current_balance from public.users where id = p_user_id;
  else
    raise exception 'Invalid token type';
  end if;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Update user balance
  if p_token_type = 'LOVE' then
    update public.users set love_balance = v_new_balance where id = p_user_id;
  else
    update public.users set love2_balance = v_new_balance where id = p_user_id;
  end if;

  -- Record transaction
  insert into public.token_transactions (
    user_id,
    type,
    token_type,
    amount,
    balance_before,
    balance_after,
    description
  ) values (
    p_user_id,
    'adjust',
    p_token_type,
    p_amount,
    v_current_balance,
    v_new_balance,
    p_description
  );
end;
$$;

revoke all on function public.adjust_user_balance(uuid, text, numeric, text) from public;
grant execute on function public.adjust_user_balance(uuid, text, numeric, text) to authenticated;