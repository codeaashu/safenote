// src/config/supabase.js
// This approach keeps keys hidden from the bundle

// Method 1: Runtime environment variables (Vercel/Netlify)
const getSupabaseConfig = () => {
  // These come from your hosting platform, not bundled
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Fallback to hardcoded for development (change these after each hack)
  return {
    url: url || 'YOUR_NEW_SUPABASE_URL_HERE',
    key: key || 'YOUR_NEW_ANON_KEY_HERE'
  };
};

// Method 2: Dynamic key loading (even better)
const loadKeysFromAPI = async () => {
  try {
    // Load keys from your own simple API endpoint
    const response = await fetch('/api/config');
    return await response.json();
  } catch {
    // Fallback to environment
    return getSupabaseConfig();
  }
};

export { getSupabaseConfig, loadKeysFromAPI };