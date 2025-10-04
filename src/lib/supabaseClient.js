import { createClient } from '@supabase/supabase-js';

// Dynamic configuration loader (secure)
let supabaseClient = null;

async function getSupabaseConfig() {
  try {
    // Try API endpoint first (works in production)
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Config API failed');
    return await response.json();
  } catch {
    console.log('API config failed, using development fallback');
    // Fallback for development mode - load from environment variables
    const config = {
      url: import.meta.env.VITE_SUPABASE_URL,
      key: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
    
    if (!config.url || !config.key) {
      throw new Error('Supabase configuration not available. Please check your environment variables.');
    }
    
    return config;
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

// Secure functions that use database functions instead of direct table access
export const secureSupabase = {
  // Create new workspace with password
  async createWorkspace(username, password) {
    const client = await getSupabaseClient();
    const { data, error } = await client.rpc('create_workspace', {
      p_username: username,
      p_password: password
    });
    
    if (error) throw error;
    return data;
  },

  // Verify workspace access
  async verifyWorkspaceAccess(username, password) {
    const client = await getSupabaseClient();
    const { data, error } = await client.rpc('verify_workspace_access', {
      p_username: username,
      p_password: password
    });
    
    if (error) throw error;
    return data;
  },

  // Get user's pastes (requires password)
  async getUserPastes(username, password) {
    const client = await getSupabaseClient();
    const { data, error } = await client.rpc('get_user_pastes', {
      p_username: username,
      p_password: password
    });
    
    if (error) throw error;
    return data;
  },

  // Create new paste (requires password)
  async createPaste(username, password, title, content, isPublic = false) {
    const client = await getSupabaseClient();
    const { data, error } = await client.rpc('create_user_paste', {
      p_username: username,
      p_password: password,
      p_title: title,
      p_content: content,
      p_is_public: isPublic
    });
    
    if (error) throw error;
    return data;
  },

  // Get public paste (no password required)
  async getPublicPaste(pasteId) {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('pastes')
      .select('*')
      .eq('id', pasteId)
      .eq('is_public', true)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// SECURITY: Remove all VITE_ variables and direct table access
// Only use secure client from API endpoint
export const supabase = {
  from: () => ({
    select: () => Promise.reject(new Error('Direct table access disabled for security. Use secureSupabase functions instead.')),
    insert: () => Promise.reject(new Error('Direct table access disabled for security. Use secureSupabase functions instead.')),
    update: () => Promise.reject(new Error('Direct table access disabled for security. Use secureSupabase functions instead.')),
    delete: () => Promise.reject(new Error('Direct table access disabled for security. Use secureSupabase functions instead.'))
  })
};

// Export the secure client as default
export default secureSupabase;
