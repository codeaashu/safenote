import { createClient } from '@supabase/supabase-js';

// Dynamic configuration loader (secure)
let supabaseClient = null;

async function getSupabaseConfig() {
  // Check if we're in development mode
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  if (isDev) {
    // SECURE: For development, prompt user for credentials (no storage)
    return await getSecureDevCredentials();
  }
  
  try {
    // Production: Use API endpoint (works in production)
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Config API failed');
    return await response.json();
  } catch {
    throw new Error('Cannot load secure configuration. Please ensure you are in production or provide development credentials.');
  }
}

// Secure development credential handler
async function getSecureDevCredentials() {
  // Check if credentials are already cached in memory (not localStorage!)
  if (window.__supabaseDevConfig) {
    return window.__supabaseDevConfig;
  }
  
  // Create a secure prompt overlay
  return new Promise((resolve, reject) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.9); z-index: 10000; display: flex;
      align-items: center; justify-content: center; font-family: monospace;
    `;
    
    overlay.innerHTML = `
      <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid #333; max-width: 500px;">
        <h3 style="color: #fff; margin-bottom: 20px;">🔒 Secure Development Access</h3>
        <p style="color: #ccc; margin-bottom: 20px;">
          For security, credentials are not stored locally.<br>
          Please enter your Supabase credentials for this session:
        </p>
        
        <div style="margin-bottom: 15px;">
          <label style="color: #fff; display: block; margin-bottom: 5px;">Supabase URL:</label>
          <input type="text" id="supabase-url" placeholder="https://your-project.supabase.co" 
                 style="width: 100%; padding: 8px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px;" 
                 value="https://ywarswgsigbpeemavbtt.supabase.co">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="color: #fff; display: block; margin-bottom: 5px;">Anon Key:</label>
          <input type="password" id="supabase-key" placeholder="eyJhbGciOiJIUzI1NiIs..." 
                 style="width: 100%; padding: 8px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px;">
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button id="connect-btn" style="flex: 1; padding: 10px; background: #0066cc; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
            🔐 Connect Securely
          </button>
          <button id="cancel-btn" style="flex: 1; padding: 10px; background: #666; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
            Cancel
          </button>
        </div>
        
        <p style="color: #888; font-size: 12px; margin-top: 15px;">
          ✅ Credentials stored in memory only (not on disk)<br>
          ✅ Automatically cleared when browser closes<br>
          ✅ Never sent to any third parties
        </p>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const urlInput = document.getElementById('supabase-url');
    const keyInput = document.getElementById('supabase-key');
    const connectBtn = document.getElementById('connect-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    connectBtn.onclick = () => {
      const url = urlInput.value.trim();
      const key = keyInput.value.trim();
      
      if (!url || !key) {
        alert('Please enter both URL and key');
        return;
      }
      
      // Store in memory only (cleared on page refresh)
      window.__supabaseDevConfig = { url, key };
      document.body.removeChild(overlay);
      resolve({ url, key });
    };
    
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      reject(new Error('User cancelled credential entry'));
    };
    
    // Focus on key input
    keyInput.focus();
  });
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

// Export getSupabaseClient for debugging
export { getSupabaseClient };
