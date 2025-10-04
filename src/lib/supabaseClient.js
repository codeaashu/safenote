import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔧 Supabase Config Debug:');
  console.log('URL:', url ? url.substring(0, 30) + '...' : 'MISSING');
  console.log('Key:', key ? 'Found (' + key.length + ' chars)' : 'MISSING');
  
  if (!url || !key) {
    throw new Error('Supabase configuration missing. Please check your environment variables.');
  }
  
  return { url, key };
}

// Create Supabase client
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    supabaseClient = createClient(config.url, config.key);
  }
  return supabaseClient;
}

// Secure functions that use your database functions
export const secureSupabase = {
  // Create new workspace
  async createWorkspace(username, password) {
    const client = getSupabaseClient();
    
    try {
      console.log('🔧 Calling create_workspace function with:', { username });
      
      const { data, error } = await client.rpc('create_workspace', {
        p_username: username,
        p_password: password
      });
      
      console.log('📊 Database response:', { data, error });
      
      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('⚠️ No data returned from database function');
        throw new Error('No response from database function');
      }
      
      return data;
    } catch (err) {
      console.error('Create workspace error:', err);
      
      // More specific error messages
      if (err.message && err.message.includes('JSON')) {
        throw new Error('Database function returned invalid response. Please check if the create_workspace function exists in your database.');
      }
      
      throw new Error('Failed to create workspace: ' + err.message);
    }
  },

  // Verify login
  async verifyLogin(username, password) {
    const client = getSupabaseClient();
    
    try {
      const { data, error } = await client.rpc('verify_login', {
        p_username: username,
        p_password: password
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Login error:', err);
      throw new Error('Failed to login: ' + err.message);
    }
  },

  // Create paste
  async createPaste(username, title, content, password = null, expiresHours = null) {
    const client = getSupabaseClient();
    
    try {
      const { data, error } = await client.rpc('create_paste', {
        p_username: username,
        p_title: title,
        p_content: content,
        p_password: password,
        p_expires_hours: expiresHours
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Create paste error:', err);
      throw new Error('Failed to create paste: ' + err.message);
    }
  },

  // Get paste
  async getPaste(pasteId, password = null) {
    const client = getSupabaseClient();
    
    try {
      const { data, error } = await client.rpc('get_paste', {
        p_paste_id: pasteId,
        p_password: password
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Get paste error:', err);
      throw new Error('Failed to get paste: ' + err.message);
    }
  },

  // Get user's pastes
  async getUserPastes(username) {
    const client = getSupabaseClient();
    
    try {
      const { data, error } = await client.rpc('get_user_pastes', {
        p_username: username
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Get user pastes error:', err);
      throw new Error('Failed to get user pastes: ' + err.message);
    }
  }
};

// Export the client for direct access if needed (for debugging)
export const supabase = getSupabaseClient();

// Export getSupabaseClient for compatibility with existing code
export { getSupabaseClient };

// Also export secureSupabase functions as individual named exports for compatibility
export const { createWorkspace, verifyLogin, createPaste, getPaste, getUserPastes } = secureSupabase;

// Export the secure client as default
export default secureSupabase;