// Security utility functions for SafeNote
// This file provides additional security layers for the application

/**
 * Password security utilities
 */
export const passwordUtils = {
  // Check password strength
  checkStrength: (password) => {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';
    
    return { checks, score, strength, isValid: score >= 4 };
  },

  // Simple hash function for client-side (Note: Use bcrypt on server-side)
  simpleHash: async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

/**
 * Input validation utilities
 */
export const validation = {
  // Sanitize username
  sanitizeUsername: (username) => {
    return username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '')
      .substring(0, 50);
  },

  // Sanitize text content
  sanitizeText: (text) => {
    return text
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .substring(0, 10000); // Limit content length
  },

  // Validate paste title
  validateTitle: (title) => {
    const sanitized = title.trim().substring(0, 200);
    return {
      isValid: sanitized.length > 0 && sanitized.length <= 200,
      sanitized
    };
  },

  // Validate paste content
  validateContent: (content) => {
    const sanitized = validation.sanitizeText(content);
    return {
      isValid: sanitized.length > 0 && sanitized.length <= 10000,
      sanitized
    };
  }
};

/**
 * Rate limiting utilities
 */
export const rateLimiter = {
  // Simple client-side rate limiting
  attempts: new Map(),

  isAllowed: (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const now = Date.now();
    const attempts = rateLimiter.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    rateLimiter.attempts.set(key, recentAttempts);
    return true;
  },

  reset: (key) => {
    rateLimiter.attempts.delete(key);
  }
};

/**
 * Secure data handling
 */
export const secureData = {
  // Encrypt sensitive data before storing locally
  encrypt: async (data, password) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = encoder.encode(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encodedData
    );
    
    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      salt: Array.from(salt)
    };
  },

  // Decrypt sensitive data
  decrypt: async (encryptedData, password) => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(encryptedData.salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
      key,
      new Uint8Array(encryptedData.encrypted)
    );
    
    return JSON.parse(decoder.decode(decrypted));
  }
};

/**
 * Security headers and CSP
 */
export const securityHeaders = {
  // Content Security Policy
  generateCSP: () => {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }
};

/**
 * Audit logging
 */
export const auditLog = {
  log: (action, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Audit Log:', logEntry);
    }
    
    // In production, you might want to send this to a logging service
    // Example: send to Vercel Analytics or external logging service
  }
};

export default {
  passwordUtils,
  validation,
  rateLimiter,
  secureData,
  securityHeaders,
  auditLog
};
