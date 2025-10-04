import { createClient } from '@supabase/supabase-js';

// Dynamic configuration loader
let supabaseClient = null;

async function getSupabaseConfig() {
  try {
    // Load config from your API endpoint (server-side)
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Config API failed');
    return await response.json();
  } catch {
    console.log('Failed to load config from API, using fallback');
    // Fallback to environment variables (only works in development)
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
}

async function getSupabaseClient() {
  if (!supabaseClient) {
    const config = await getSupabaseConfig();
    
    if (!config.url || !config.key) {
      throw new Error('Supabase configuration not available');
    }
    
    supabaseClient = createClient(config.url, config.key);
  }
  return supabaseClient;
}

// Export async function instead of direct client
export { getSupabaseClient };

// For backward compatibility, create client with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.error("Supabase env vars missing!", { supabaseUrl, supabaseAnonKey });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
