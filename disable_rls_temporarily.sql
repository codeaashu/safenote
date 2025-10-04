-- TEMPORARY FIX: Disable RLS for basic functionality
-- Run this in Supabase SQL Editor to make user creation work

-- Disable RLS temporarily (we'll re-enable after proper auth is implemented)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE pastes DISABLE ROW LEVEL SECURITY;

-- Your app will now work like before, but with NEW KEYS that aren't exposed
-- This gives you a working V2 while you implement proper authentication

-- TODO: Later, when you implement proper session management:
-- 1. ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- 2. ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;  
-- 3. Create proper policies based on authenticated user sessions