# SafeNote V2 - New Supabase Configuration

## After you create the new Supabase project, we'll update:

### 1. Create new .env.local (with new keys)
```bash
# New secure project credentials
VITE_SUPABASE_URL=https://your-new-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key-here
```

### 2. Set up proper RLS policies from the start
```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- Proper policies (not the broken ones from v1)
CREATE POLICY "Users can only see own data" ON users
FOR ALL USING (false); -- We'll update this with proper auth

CREATE POLICY "Pastes are private by default" ON pastes  
FOR ALL USING (false); -- We'll update this with proper auth
```

### 3. Deploy strategy to hide keys
- Deploy to Vercel with environment variables
- Keys never appear in the built JavaScript
- Rotate keys immediately if compromised

### 4. Marketing update
```
🚨 UPDATE: SafeNote V1 successfully hacked!

Props to the hackers who found the exposed API keys.

SafeNote V2 launching with:
✅ Proper key management
✅ Row-level security  
✅ Key rotation system
✅ $500 bounty (double or nothing!)

Building in public means failing in public.
But failing fast = learning fast.

V2 drops this week. Who's ready? 🔥
```

## Ready to create the project? Click "Create new project" and let's build the unhackable version! 💪