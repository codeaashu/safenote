// src/lib/secureClient.js
// Load Supabase config at runtime, not build time

class SecureSupabaseClient {
  constructor() {
    this.client = null;
    this.config = null;
  }

  // Method 1: Load from your own API endpoint
  async loadConfigFromAPI() {
    try {
      // You create a simple endpoint that returns config
      const response = await fetch('/api/config');
      return await response.json();
    } catch (error) {
      console.log('API config failed');
      return null;
    }
  }

  // Method 2: Load from localStorage (for key rotation)
  loadConfigFromStorage() {
    try {
      const stored = localStorage.getItem('supabase_config_v2');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Method 3: Prompt user for config (ultimate security)
  async promptForConfig() {
    // For super secure mode, user enters their own instance details
    return {
      url: prompt('Enter Supabase URL:'),
      key: prompt('Enter Supabase Key:')
    };
  }

  async getClient() {
    if (!this.client) {
      // Try different methods to get config
      this.config = await this.loadConfigFromAPI() || 
                   this.loadConfigFromStorage() ||
                   await this.promptForConfig();

      if (this.config?.url && this.config?.key) {
        const { createClient } = await import('@supabase/supabase-js');
        this.client = createClient(this.config.url, this.config.key);
      } else {
        throw new Error('Failed to load Supabase configuration');
      }
    }
    return this.client;
  }

  // Store new config (for key rotation)
  storeConfig(config) {
    localStorage.setItem('supabase_config_v2', JSON.stringify(config));
    this.config = config;
    this.client = null; // Force recreation
  }

  // Rotate keys when compromised
  async rotateKeys() {
    const newConfig = await this.loadConfigFromAPI();
    if (newConfig) {
      this.storeConfig(newConfig);
      window.location.reload(); // Force app reload with new keys
    }
  }
}

export const secureSupabase = new SecureSupabaseClient();