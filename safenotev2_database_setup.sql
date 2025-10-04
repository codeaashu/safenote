-- ==========================================
-- SAFENOTE V2 - SECURE DATABASE SETUP
-- ==========================================
-- Run this in your Supabase SQL Editor for safenotev2 project

-- 1. CREATE USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE PASTES TABLE  
-- ==========================================
CREATE TABLE IF NOT EXISTS pastes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  username VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  view_count INTEGER DEFAULT 0
);

-- 3. CREATE INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_pastes_username ON pastes(username);
CREATE INDEX IF NOT EXISTS idx_pastes_created_at ON pastes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_pastes_is_public ON pastes(is_public);

-- 4. ENABLE ROW LEVEL SECURITY (PROPER THIS TIME!)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- 5. CREATE SECURE RLS POLICIES
-- ==========================================

-- Users Table Policies
-- Users can only see their own account data
CREATE POLICY "Users can only access own account" ON users
FOR ALL USING (false); -- Deny all direct access for now

-- Pastes Table Policies  
-- Users can only access their own pastes (by username matching)
CREATE POLICY "Users can only access own pastes" ON pastes
FOR ALL USING (false); -- Deny all direct access for now

-- Public pastes can be viewed by anyone (for sharing feature)
CREATE POLICY "Public pastes are viewable" ON pastes
FOR SELECT USING (is_public = true);

-- 6. CREATE UPDATED_AT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. CREATE TRIGGERS FOR AUTO TIMESTAMPS
-- ==========================================
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pastes_updated_at 
    BEFORE UPDATE ON pastes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. CREATE ADDITIONAL SECURITY FUNCTIONS
-- ==========================================

-- Function to safely get current user's username (you'll implement this)
CREATE OR REPLACE FUNCTION get_current_username()
RETURNS TEXT AS $$
BEGIN
    -- This will be implemented when you add proper authentication
    -- For now, return null to deny all access
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. GRANT NECESSARY PERMISSIONS
-- ==========================================
-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions (limited by RLS)
GRANT ALL ON TABLE users TO anon, authenticated;
GRANT ALL ON TABLE pastes TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 10. INSERT SOME TEST DATA (OPTIONAL)
-- ==========================================
-- Uncomment below if you want some test data

/*
INSERT INTO users (username, password) VALUES 
('testuser', '$2b$10$example.hash.here'),
('admin', '$2b$10$another.hash.here');

INSERT INTO pastes (title, content, username, is_public) VALUES 
('Test Note', 'This is a test note content', 'testuser', false),
('Public Note', 'This note is public for testing', 'testuser', true);
*/

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================
-- Your SafeNote V2 database is now ready with:
-- ✅ Proper table structure
-- ✅ Row Level Security enabled  
-- ✅ Secure policies (deny by default)
-- ✅ Performance indexes
-- ✅ Auto-updating timestamps
-- ✅ Public sharing capability
-- ✅ Proper permissions

-- Next steps:
-- 1. Get your new Supabase URL and keys
-- 2. Update your .env.local file
-- 3. Deploy with environment variables (not in bundle)
-- 4. Test the security before any challenges!