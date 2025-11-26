# Quick SQL Execution Guide

Your Supabase project is now linked. Here's the fastest way to apply the migrations:

## Option 1: Supabase SQL Editor (Recommended - 2 minutes)

1. Open: https://app.supabase.com/project/ctgqznazjyplpuwmehav/sql/new
2. Copy and paste the SQL from `supabase/migrations/20251124230000_add_tokens.sql`
3. Click "Run"
4. Then create a new query with `supabase/migrations/20251124235000_create_events_and_attendees.sql`
5. Click "Run"

## After Migrations are Applied

Run this command to regenerate TypeScript types:

```bash
$env:SUPABASE_ACCESS_TOKEN="sbp_6d2cd1409d8a266704d6db0d10f9e87251d64b12"
npx supabase gen types typescript --project-ref ctgqznazjyplpuwmehav --schema public > src/integrations/supabase/types.ts
```

This will update `src/integrations/supabase/types.ts` with the new tables and columns.

## Status

✅ Supabase CLI linked successfully
⏳ Waiting for migrations to be applied via SQL Editor
⏳ Then regenerate types
