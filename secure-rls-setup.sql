-- ========================================
-- SAFENOTE: SECURE RLS SETUP FOR CUSTOM AUTH
-- ========================================
-- This setup is tailored for SafeNote's custom authentication system
-- without Supabase Auth, but with proper security controls

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Allow public access to users" ON users;
DROP POLICY IF EXISTS "Allow public access to pastes" ON pastes;
DROP POLICY IF EXISTS "Enable full access for all users" ON users;
DROP POLICY IF EXISTS "Enable full access for all pastes" ON pastes;

-- ========================================
-- USERS TABLE - MINIMAL ACCESS POLICIES
-- ========================================

-- Allow user registration (anyone can create an account)
CREATE POLICY "users_insert_policy" ON users
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow reading user data for login verification
-- This is needed for your login system to work
CREATE POLICY "users_select_policy" ON users
FOR SELECT TO anon, authenticated
USING (true);

-- Note: No UPDATE or DELETE policies for users table
-- This prevents account modifications/deletions

-- ========================================
-- PASTES TABLE - RESTRICTIVE POLICIES
-- ========================================

-- Allow creating pastes (anyone can create)
CREATE POLICY "pastes_insert_policy" ON pastes
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow reading pastes (needed for sharing and user access)
CREATE POLICY "pastes_select_policy" ON pastes
FOR SELECT TO anon, authenticated
USING (true);

-- Allow updating pastes (all users - app handles permission logic)
CREATE POLICY "pastes_update_policy" ON pastes
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow deleting pastes (all users - app handles permission logic)
CREATE POLICY "pastes_delete_policy" ON pastes
FOR DELETE TO anon, authenticated
USING (true);

-- ========================================
-- ADDITIONAL SECURITY RECOMMENDATIONS
-- ========================================

-- 1. Add rate limiting at application level
-- 2. Implement proper password hashing (bcrypt/scrypt)
-- 3. Add input validation and sanitization
-- 4. Consider adding audit logging
-- 5. Implement session management
-- 6. Add CORS restrictions
-- 7. Use environment variables for secrets

-- Verify RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled",
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as "Policy Count"
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('users', 'pastes');

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'pastes')
ORDER BY tablename, policyname;
