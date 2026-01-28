-- ============================================================================
-- REMOVE MOCK USERS WITH @example.com EMAILS
-- ============================================================================
-- This script removes all test/mock users that have emails ending in @example.com
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- First, let's see what we're about to delete (preview)
SELECT
    u.id,
    u.email,
    u.display_name
FROM public.users u
WHERE u.email LIKE '%@example.com';

-- Count of mock users to be deleted
SELECT COUNT(*) as mock_user_count
FROM public.users
WHERE email LIKE '%@example.com';

-- ============================================================================
-- DELETION SECTION
-- ============================================================================

-- Delete related data first (due to foreign key constraints)

-- Delete likes involving mock users
DELETE FROM public.likes 
WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE '%@example.com')
   OR target_user_id IN (SELECT id FROM public.users WHERE email LIKE '%@example.com');

-- Delete messages from mock users
DELETE FROM public.messages 
WHERE sender_id IN (SELECT id FROM public.users WHERE email LIKE '%@example.com');

-- Delete thread participants for mock users
DELETE FROM public.thread_participants 
WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE '%@example.com');

-- Delete threads that only had mock users (orphaned threads)
DELETE FROM public.threads 
WHERE id NOT IN (SELECT DISTINCT thread_id FROM public.thread_participants WHERE thread_id IS NOT NULL);

-- Delete token transactions for mock users
DELETE FROM public.token_transactions 
WHERE user_id IN (SELECT id FROM public.users WHERE email LIKE '%@example.com');

-- Delete swap requests for mock users (using auth_user_id from profiles to match)
-- Note: swap_requests.user_id might be bigint referencing profiles.id, not uuid
DELETE FROM public.swap_requests 
WHERE user_id IN (
    SELECT p.id FROM public.profiles p 
    WHERE p.email LIKE '%@example.com'
       OR p.auth_user_id IN (SELECT id FROM public.users WHERE email LIKE '%@example.com')
);

-- Delete from profiles table
DELETE FROM public.profiles 
WHERE email LIKE '%@example.com'
   OR auth_user_id IN (SELECT id FROM public.users WHERE email LIKE '%@example.com');

-- Finally, delete the mock users from the users table
DELETE FROM public.users 
WHERE email LIKE '%@example.com';

-- Verify deletion
SELECT COUNT(*) as remaining_mock_users 
FROM public.users 
WHERE email LIKE '%@example.com';

-- Show remaining real users
SELECT 
    id,
    email,
    display_name,
    role
FROM public.users
LIMIT 20;

SELECT 'Mock users with @example.com emails have been removed!' as result;
