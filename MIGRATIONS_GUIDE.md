# How to Apply Database Migrations

This guide explains how to apply the pending Supabase migrations to your project.

## Migrations to Apply

1. `supabase/migrations/20251124230000_add_tokens.sql` - Adds token balance and transaction tracking
2. `supabase/migrations/20251124235000_create_events_and_attendees.sql` - Adds events and attendees tables with RLS

## Method 1: Using Supabase Web Dashboard (Easiest)

1. Go to your Supabase project: https://app.supabase.com/projects
2. Select your project: **love2match** (ctgqznazjyplpuwmehav)
3. Navigate to **SQL Editor** (left sidebar)
4. Create a new query and copy-paste the contents of:
   - `supabase/migrations/20251124230000_add_tokens.sql`
   - Run it (click "Run" or Ctrl+Enter)
5. Create another new query and copy-paste:
   - `supabase/migrations/20251124235000_create_events_and_attendees.sql`
   - Run it

Expected output: "Success. No rows returned."

## Method 2: Using Supabase CLI

You need the Supabase access token for your project:

1. Go to https://app.supabase.com/account/tokens
2. Create a new token or copy an existing one
3. Run:

```bash
npx supabase link --project-ref ctgqznazjyplpuwmehav
# When prompted, paste your access token

npx supabase db push
```

This will automatically detect and apply pending migrations.

## After Applying Migrations

Once migrations are applied, you need to regenerate the TypeScript types:

```bash
npx supabase gen types typescript --project-ref ctgqznazjyplpuwmehav --schema public > src/integrations/supabase/types.ts
```

Or if using the CLI link:

```bash
npx supabase gen types typescript > src/integrations/supabase/types.ts
```

This will:
- Add the `events` table type
- Add the `event_attendees` table type
- Add token balance columns to the `users` table type
- Add the `token_transactions` table type

## Verifying Migrations

After applying migrations, verify in Supabase:

1. Go to **Database** → **Tables**
2. You should see:
   - `events` (new)
   - `event_attendees` (new)
   - `token_transactions` (new)
   - `users` with new columns: `love_balance`, `love2_balance`

## Next Steps

After regenerating types, the codebase will use typed Supabase client calls instead of `(supabase as any)` casts, which will resolve all TypeScript compile errors.

---

**Note:** These migrations use `if not exists` clauses, so they're safe to run even if partially applied before.
