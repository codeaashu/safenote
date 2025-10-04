// Secure Supabase client that uses database functions instead of direct table access
import { createClient } from '@supabase/supabase-js';

// Dynamic configuration loader (secure)
let supabaseClient = null;

async function getSupabaseConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Config API failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to load secure config:', error);
    throw new Error('Cannot initialize secure connection');
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

// Secure workspace functions that require password verification
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

// Export the secure client
export default secureSupabase;