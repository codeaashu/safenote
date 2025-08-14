-- Re-enable RLS and set up proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to read and insert users (for login/signup)
CREATE POLICY "Allow public access to users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Policy 2: Allow anyone to read and insert pastes (we handle username filtering in app)
CREATE POLICY "Allow public access to pastes" ON pastes
  FOR ALL USING (true) WITH CHECK (true);

-- Alternative more secure approach (optional):
-- Policy 1: Users can only see their own data
-- CREATE POLICY "Users can access own data" ON users
--   FOR ALL USING (auth.jwt() ->> 'sub' = id::text);

-- Policy 2: Pastes are filtered by username in application logic
-- CREATE POLICY "Allow paste operations" ON pastes
--   FOR ALL USING (true) WITH CHECK (true);
