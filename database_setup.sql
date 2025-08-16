-- Create users table for storing username and password
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add username column to existing pastes table
ALTER TABLE pastes ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pastes_username ON pastes(username);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Enable Row Level Security (optional, for extra security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since we're handling auth manually)
CREATE POLICY "Allow public access to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow public access to pastes" ON pastes FOR ALL USING (true);
