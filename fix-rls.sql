-- Disable RLS temporarily for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE pastes DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, use these policies instead:
-- DROP POLICY IF EXISTS "Allow public access to users" ON users;
-- DROP POLICY IF EXISTS "Allow public access to pastes" ON pastes;

-- CREATE POLICY "Enable full access for all users" ON users FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Enable full access for all pastes" ON pastes FOR ALL USING (true) WITH CHECK (true);
