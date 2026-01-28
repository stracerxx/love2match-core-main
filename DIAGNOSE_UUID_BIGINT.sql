-- DIAGNOSE UUID/BIGINT TYPE MISMATCH
-- Run each query separately to find the issue

-- Query 1: Check RLS policies that use auth.uid()
SELECT 
    schemaname,
    tablename,
    policyname,
    qual
FROM pg_policies 
WHERE qual LIKE '%auth.uid()%'
ORDER BY tablename;

-- Query 2: Check column types for id/user_id columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name IN ('user_id', 'auth_user_id', 'id') 
AND table_schema = 'public'
ORDER BY table_name;
