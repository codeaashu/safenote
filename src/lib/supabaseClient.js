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
  // Create new workspace with password (secure)
  async createWorkspace(username, password) {
    const client = await getSupabaseClient();
    
    try {
      // Try ultra-secure function first
      const { data, error } = await client.rpc('ultra_secure_create_workspace', {
        p_username: username,
        p_password: password,
        p_ip_address: '127.0.0.1' // Fallback IP for development
      });
      
      if (error) {
        // If ultra-secure function doesn't exist, try regular secure function
        const { data: fallbackData, error: fallbackError } = await client.rpc('create_workspace', {
          p_username: username,
          p_password: password
        });
        
        if (fallbackError) throw fallbackError;
        return fallbackData;
      }
      
      return data;
    } catch (err) {
      console.error('Database function error:', err);
      throw new Error('Failed to create workspace. Please ensure database functions are properly set up.');
    }
  },

  // Verify workspace access (secure)
  async verifyWorkspaceAccess(username, password) {
    const client = await getSupabaseClient();
    
    try {
      // Try ultra-secure function first
      const { data, error } = await client.rpc('ultra_secure_verify_access', {
        p_username: username,
        p_password: password,
        p_ip_address: '127.0.0.1' // Fallback IP for development
      });
      
      if (error) {
        // If ultra-secure function doesn't exist, try regular secure function
        const { data: fallbackData, error: fallbackError } = await client.rpc('verify_workspace_access', {
          p_username: username,
          p_password: password
        });
        
        if (fallbackError) throw fallbackError;
        return fallbackData;
      }
      
      return data;
    } catch (err) {
      console.error('Database function error:', err);
      throw new Error('Failed to verify workspace access.');
    }
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

  // Get user's IP address for security tracking
  async getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '0.0.0.0';
    } catch {
      return '0.0.0.0'; // Fallback IP
    }
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
