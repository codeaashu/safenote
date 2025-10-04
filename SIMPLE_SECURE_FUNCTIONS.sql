-- ==========================================
-- SIMPLE SECURE WORKSPACE FUNCTIONS
-- ==========================================
-- Run this in your Supabase SQL Editor if you're getting "Error checking user"

-- First, check what functions currently exist
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%workspace%';

-- ==========================================
-- CREATE SIMPLE BUT SECURE FUNCTIONS
-- ==========================================

-- Function to safely create workspace
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
  
  -- Create user (password should be hashed on client side)
  INSERT INTO users (username, password) 
  VALUES (p_username, p_password);
  
  RETURN json_build_object('success', true, 'username', p_username);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', 'Failed to create workspace: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely verify workspace access
CREATE OR REPLACE FUNCTION verify_workspace_access(
  p_username VARCHAR(50),
  p_password VARCHAR(255)
) RETURNS JSON AS $$
DECLARE
  stored_password VARCHAR(255);
BEGIN
  -- Get stored password hash
  SELECT password INTO stored_password 
  FROM users 
  WHERE username = p_username;
  
  IF stored_password IS NULL THEN
    RETURN json_build_object('error', 'Workspace not found');
  END IF;
  
  -- Simple password check (you should use bcrypt)
  IF stored_password = p_password THEN
    RETURN json_build_object('success', true, 'username', p_username);
  ELSE
    RETURN json_build_object('error', 'Invalid password');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', 'Access verification failed: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_workspace(VARCHAR, VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_workspace_access(VARCHAR, VARCHAR) TO anon, authenticated;

-- ==========================================
-- TEST THE FUNCTIONS
-- ==========================================

-- Test creating a workspace (should work)
SELECT create_workspace('testuser123', 'testpassword123');

-- Test creating duplicate (should return error)
SELECT create_workspace('testuser123', 'testpassword123');

-- Test verifying access (should work)
SELECT verify_workspace_access('testuser123', 'testpassword123');

-- Test wrong password (should return error)
SELECT verify_workspace_access('testuser123', 'wrongpassword');

-- Cleanup test user
DELETE FROM users WHERE username = 'testuser123';