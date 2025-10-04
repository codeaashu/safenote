-- TEST: Check if functions exist in your database
-- Run this in Supabase SQL Editor to see what functions you have

SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%workspace%'
ORDER BY routine_name;

-- Also check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;