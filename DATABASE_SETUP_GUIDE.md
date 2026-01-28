# Love2Match Database Setup Guide

## Quick Start

For a **fresh Supabase project**, run the consolidated migration file:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy and paste the contents of: supabase/migrations/001_complete_setup.sql
```

## Migration File Location

**Primary Setup File:** `supabase/migrations/001_complete_setup.sql`

This single file contains:
- All table definitions (users, profiles, threads, messages, etc.)
- All RPC functions (messaging, admin, faucet)
- Row Level Security (RLS) policies
- Security triggers
- Indexes for performance

## Legacy SQL Files (Deprecated)

The following files in the root directory are **deprecated** and have been consolidated into the main migration. They are kept for reference only:

| File | Status | Notes |
|------|--------|-------|
| `MESSAGING_ESCROW.sql` | ✅ Consolidated | Messaging functions |
| `FIX_MESSAGING_RLS.sql` | ✅ Consolidated | RLS policies for messages |
| `FIX_ADMIN_RPC_FINAL.sql` | ✅ Consolidated | Admin user listing |
| `FIX_TOKEN_FAUCET.sql` | ✅ Consolidated | Token transaction types |
| `LOCKDOWN_SECURITY.sql` | ✅ Consolidated | Role protection trigger |
| `GLOBAL_SECURITY_LOCKDOWN.sql` | ✅ Consolidated | Full RLS setup |
| `fix_rls_policies.sql` | ⚠️ Deprecated | Use main migration |
| `disable_rls_quick_fix.sql` | ⚠️ Deprecated | For debugging only |
| `complete_rls_disable.sql` | ⚠️ Deprecated | For debugging only |
| `FIX_ADMIN_USERS.sql` | ⚠️ Deprecated | Superseded |
| `FIX_ADMIN_RPC_*.sql` | ⚠️ Deprecated | Multiple iterations |
| `MAKE_ME_ADMIN.sql` | ⚠️ Deprecated | Use admin panel |
| `DEBUG_*.sql` | ⚠️ Deprecated | Debugging scripts |

## Cleanup Commands

To clean up the deprecated SQL files (optional):

```bash
# Create archive folder
mkdir -p sql_archive

# Move deprecated files
mv FIX_*.sql sql_archive/
mv DEBUG_*.sql sql_archive/
mv DIAGNOSTIC_*.sql sql_archive/
mv MESSAGING_ESCROW.sql sql_archive/
mv LOCKDOWN_SECURITY.sql sql_archive/
mv GLOBAL_SECURITY_LOCKDOWN.sql sql_archive/
mv fix_rls_policies.sql sql_archive/
mv disable_rls_quick_fix.sql sql_archive/
mv complete_rls_disable.sql sql_archive/
mv MAKE_ME_ADMIN.sql sql_archive/
mv GRANT_TOKENS.sql sql_archive/
mv NUCLEAR_FIX.sql sql_archive/
mv IMMEDIATE_FIX.sql sql_archive/
mv FINAL_COMPLETE_FIX.sql sql_archive/
mv SETUP_ADMIN_*.sql sql_archive/
mv COMPLETE_ADMIN_SETUP.sql sql_archive/
mv UPDATE_SHANE_TO_ADMIN.sql sql_archive/
mv CHECK_SHANE_STATUS.sql sql_archive/
```

## Environment Variables

Required in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Optional
VITE_SOLANA_CLUSTER=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Database Schema Overview

### Core Tables

1. **users** - User accounts (extends auth.users)
   - Token balances (love_balance, love2_balance)
   - Profile info (display_name, bio, photos)
   - Membership tier

2. **profiles** - Legacy/alternative profile storage
   - Linked to auth.users via auth_user_id

3. **threads** - Message conversations
   - Escrow tracking for first messages

4. **messages** - Individual messages

5. **thread_participants** - Links users to threads

6. **token_transactions** - Transaction history

7. **swap_requests** - LOVE to LOVE2 exchange requests

8. **app_config** - Platform configuration

### Key RPC Functions

| Function | Purpose |
|----------|---------|
| `get_or_create_thread(uuid)` | Start/resume conversation |
| `list_threads()` | Get user's conversations |
| `list_messages(uuid)` | Get messages in thread |
| `escrow_v13_final(text, text, text)` | Send message with escrow |
| `get_admin_users()` | Admin: list all users |
| `claim_daily_faucet()` | User: claim daily tokens |
| `get_mutual_matches()` | Get matched users |
| `increment_likes(uuid)` | Track daily likes |

## Security Features

1. **Row Level Security (RLS)** - All tables protected
2. **Role Protection Trigger** - Prevents self-promotion to admin
3. **SECURITY DEFINER Functions** - Controlled data access
4. **Admin-only Operations** - Protected by role checks

## Troubleshooting

### "Insufficient tokens" Error
Users can claim daily tokens via the Wallet page faucet.

### "Access denied" on Admin
1. Check user's role in profiles table
2. Ensure role = 'admin'
3. Use Supabase dashboard to update if needed

### Messages Not Loading
Run `FIX_MESSAGING_RLS.sql` or ensure the main migration was applied.

### Database Connection Issues
Check the `/health` endpoint for diagnostics.

## Support

For issues, check:
1. Supabase Dashboard → Logs
2. Browser Console for API errors
3. `/health` page for connectivity status
