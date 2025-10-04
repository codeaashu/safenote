// src/lib/secureSupabase.js
// Dynamic key loading system - keys change every time they're compromised

class SecureSupabaseManager {
  constructor() {
    this.currentConfig = null;
    this.keyVersion = 1;
  }

  // Load configuration dynamically
  async getConfig() {
    if (!this.currentConfig) {
      await this.loadConfig();
    }
    return this.currentConfig;
  }

  // Method 1: Load from your simple backend endpoint
  async loadFromAPI() {
    try {
      const response = await fetch('https://your-simple-api.vercel.app/config');
      const config = await response.json();
      return config;
    } catch {
      console.log('API config failed, using fallback');
      return this.getFallbackConfig();
    }
  }

  // Method 2: Fallback configuration (you can change these anytime)
  getFallbackConfig() {
    return {
      url: 'https://your-new-project.supabase.co',
      key: 'your-new-anon-key-here',
      version: this.keyVersion
    };
  }

  // Method 3: Load from localStorage (for key rotation)
  getStoredConfig() {
    try {
      const stored = localStorage.getItem('supabase_config');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Store new config when keys are rotated
  storeConfig(config) {
    localStorage.setItem('supabase_config', JSON.stringify(config));
    this.currentConfig = config;
  }

  // Main config loading logic
  async loadConfig() {
    // Try API first, then stored, then fallback
    let config = await this.loadFromAPI();
    
    if (!config) {
      config = this.getStoredConfig() || this.getFallbackConfig();
    }

    this.currentConfig = config;
    return config;
  }

  // When keys get compromised, call this to rotate
  async rotateKeys() {
    this.keyVersion++;
    const newConfig = await this.loadFromAPI();
    if (newConfig) {
      this.storeConfig(newConfig);
      // Reload your Supabase client with new config
      window.location.reload(); // Force reload with new keys
    }
  }
}

export const supabaseManager = new SecureSupabaseManager();