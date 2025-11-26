# Fix UUID/BIGINT Database Error

## Problem
You're encountering the error:
```
Error: Failed to run sql query: ERROR: 42883: operator does not exist: uuid = bigint
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

## Root Cause
The existing database has a `token_transactions` table where `user_id` is stored as `BIGINT`, but the new code and migrations expect `UUID` type references to `auth.users(id)`.

## Solution
Apply the new comprehensive migrations that properly handle this type conflict and create all the missing entities for the enhanced Love2Match features.

## Step-by-Step Fix

### 1. Apply New Migrations Manually

Go to the Supabase SQL Editor:
**URL**: https://app.supabase.com/project/ctgqznazjyplpuwmehav/sql

Apply these migrations **IN ORDER**:

#### Migration 1: Core Entities
Copy and paste the content from:
`supabase/migrations/20251125000001_add_core_entities.sql`

This creates:
- `app_config` table with default settings
- `swap_requests` table for token exchange
- Proper RLS policies

#### Migration 2: Enhanced Token Transactions
Copy and paste the content from:
`supabase/migrations/20251125000002_add_token_transactions.sql`

This creates:
- Enhanced `token_transactions` table with proper UUID references
- Creator verification system
- Daily swap limits
- Proper type handling for UUID/BIGINT conflicts

#### Migration 3: Content and Gifting
Copy and paste the content from:
`supabase/migrations/20251125000003_add_content_and_gifts.sql`

This creates:
- Premium content marketplace
- Gifting system
- Content purchases and reviews
- Creator earnings tracking

#### Migration 4: Subscriptions and Businesses
Copy and paste the content from:
`supabase/migrations/20251125000004_add_subscriptions_and_businesses.sql`

This creates:
- Subscription tiers
- Business profiles
- Video call scheduling
- Advanced filtering preferences

#### Migration 5: Admin Functions
Copy and paste the content from:
`supabase/migrations/20251125000005_add_admin_functions.sql`

This creates:
- Admin analytics functions
- Bulk user management
- Swap request processing
- System health monitoring

### 2. Alternative: Skip Problematic Old Migration

If you continue to get errors, you can skip the problematic old migration:

1. Delete or rename the old migration file:
   ```
   supabase/migrations/20251124230000_add_tokens.sql
   ```

2. The new migrations (00001-00005) contain all the necessary schema and handle the UUID/BIGINT conflict properly.

### 3. Verify Success

After applying all migrations:

1. Check that all tables are created:
   - `app_config`
   - `swap_requests`
   - `token_transactions` (enhanced version)
   - `creator_verifications`
   - `premium_content`
   - `gifts`
   - `subscriptions`
   - `business_profiles`
   - etc.

2. Test the admin dashboard at: http://localhost:8080/admin

3. Verify that swap requests and user management work correctly.

## Why This Works

The new migrations:
- Use proper UUID references throughout
- Handle type casting explicitly where needed
- Include comprehensive error handling
- Create all the missing entities from the original Love2Match feature set
- Maintain backward compatibility while adding new features

## Troubleshooting

If you still encounter issues:

1. **Check existing table structure**: Look at the current `token_transactions` table to see if `user_id` is BIGINT
2. **Manual type conversion**: You may need to manually convert existing BIGINT user_ids to UUID format
3. **Reset database**: As a last resort, you can reset the database (but this will lose existing data)

## Features Enabled After Fix

Once the migrations are applied, you'll have:

✅ **Dual Token System** - LOVE and LOVE2 with swap functionality  
✅ **Creator Economy** - Verification, premium content, earnings  
✅ **Admin Dashboard** - User management, analytics, swap approvals  
✅ **Gifting System** - Send tokens and gifts to other users  
✅ **Premium Content** - Creator marketplace with purchases  
✅ **Subscription Tiers** - Different membership levels  
✅ **Business Integration** - Business profiles and video calls  
✅ **Advanced Filtering** - Enhanced user discovery  
✅ **Referral Program** - User acquisition incentives  

The UUID/BIGINT error will be resolved and all enhanced features will be available.