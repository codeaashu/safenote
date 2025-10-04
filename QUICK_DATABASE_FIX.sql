-- ==========================================
-- QUICK FIX: Run this in your Supabase SQL Editor
-- ==========================================
-- This will create the required functions and test them

-- First, let's check if the users table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create secure policy (blocks direct access)
DROP POLICY IF EXISTS "Block all direct user access" ON users;
CREATE POLICY "Block all direct user access" ON users FOR ALL USING (false);

-- Create the workspace function
CREATE OR REPLACE FUNCTION create_workspace(
  p_username VARCHAR(50),
  p_password VARCHAR(255)
) RETURNS JSON AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user already exists
  SELECT EXISTS(SELECT 1 FROM users WHERE username = p_username) INTO user_exists;
  
  IF user_exists THEN
    RETURN json_build_object('error', 'Username already exists');
  END IF;
  
  -- Create user
  INSERT INTO users (username, password) VALUES (p_username, p_password);
  
  RETURN json_build_object('success', true, 'username', p_username);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', 'Failed to create workspace: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_workspace(VARCHAR, VARCHAR) TO anon, authenticated;

-- Test the function
SELECT create_workspace('test_user_' || extract(epoch from now()), 'test_password');

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================
SELECT 'Database setup complete! Your create_workspace function is ready.' as status;