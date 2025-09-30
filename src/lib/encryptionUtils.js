/**
 * End-to-End Encryption Utilities for SafeNote
 * 
 * This module provides client-side encryption/decryption using Web Crypto API
 * - Uses AES-GCM for authenticated encryption
 * - PBKDF2 for key derivation from passwords
 * - All encryption happens in the browser - server never sees plain text
 */

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12, // 96 bits for GCM
  tagLength: 128, // 128 bits for authentication tag
  saltLength: 32, // 256 bits salt for PBKDF2
  iterations: 100000, // PBKDF2 iterations (secure but performant)
};

/**
 * Generate a cryptographically secure random array
 * @param {number} length - Length of the array in bytes
 * @returns {Uint8Array} - Random bytes
 */
const generateRandomBytes = (length) => {
  return crypto.getRandomValues(new Uint8Array(length));
};

/**
 * Convert string to ArrayBuffer
 * @param {string} str - String to convert
 * @returns {ArrayBuffer} - ArrayBuffer representation
 */
const stringToArrayBuffer = (str) => {
  return new TextEncoder().encode(str);
};

/**
 * Convert ArrayBuffer to string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} - String representation
 */
const arrayBufferToString = (buffer) => {
  return new TextDecoder().decode(buffer);
};

/**
 * Convert ArrayBuffer to base64 string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} - Base64 string
 */
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Convert base64 string to ArrayBuffer
 * @param {string} base64 - Base64 string
 * @returns {ArrayBuffer} - ArrayBuffer representation
 */
const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Derive encryption key from password using PBKDF2
 * @param {string} password - User password
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} - Derived encryption key
 */
export const deriveKeyFromPassword = async (password, salt) => {
  try {
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      stringToArrayBuffer(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive AES-GCM key
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ENCRYPTION_CONFIG.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  } catch (error) {
    console.error('Error deriving key from password:', error);
    throw new Error('Failed to derive encryption key');
  }
};

/**
 * Encrypt text using AES-GCM
 * @param {string} plaintext - Text to encrypt
 * @param {string} password - User password
 * @returns {Promise<string>} - Base64 encoded encrypted data with metadata
 */
export const encryptText = async (plaintext, password) => {
  try {
    console.log('🔐 Starting encryption process...');
    console.log('🔐 Crypto API available:', !!crypto?.subtle);
    
    // Generate random salt and IV
    const salt = generateRandomBytes(ENCRYPTION_CONFIG.saltLength);
    const iv = generateRandomBytes(ENCRYPTION_CONFIG.ivLength);

    console.log('🔐 Generated salt and IV');

    // Derive key from password
    const key = await deriveKeyFromPassword(password, salt);
    console.log('🔐 Key derived successfully');

    // Encrypt the plaintext
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: iv,
      },
      key,
      stringToArrayBuffer(plaintext)
    );

    console.log('🔐 Text encrypted successfully');

    // Combine salt, iv, and encrypted data
    const combinedBuffer = new Uint8Array(
      salt.length + iv.length + encryptedBuffer.byteLength
    );
    
    combinedBuffer.set(salt, 0);
    combinedBuffer.set(iv, salt.length);
    combinedBuffer.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

    // Return as base64 string
    const result = arrayBufferToBase64(combinedBuffer.buffer);
    console.log('🔐 Encryption completed, result length:', result.length);
    return result;
  } catch (error) {
    console.error('❌ Error encrypting text:', error);
    console.error('❌ Crypto support:', !!window.crypto);
    console.error('❌ Subtle crypto support:', !!window.crypto?.subtle);
    throw new Error('Failed to encrypt text');
  }
};

/**
 * Decrypt text using AES-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} password - User password
 * @returns {Promise<string>} - Decrypted plaintext
 */
export const decryptText = async (encryptedData, password) => {
  try {
    // Convert from base64
    const combinedBuffer = base64ToArrayBuffer(encryptedData);
    const combinedArray = new Uint8Array(combinedBuffer);

    // Extract salt, iv, and encrypted data
    const salt = combinedArray.slice(0, ENCRYPTION_CONFIG.saltLength);
    const iv = combinedArray.slice(
      ENCRYPTION_CONFIG.saltLength,
      ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength
    );
    const encryptedBuffer = combinedArray.slice(
      ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength
    );

    // Derive key from password
    const key = await deriveKeyFromPassword(password, salt);

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: iv,
      },
      key,
      encryptedBuffer
    );

    // Convert back to string
    return arrayBufferToString(decryptedBuffer);
  } catch (error) {
    console.error('Error decrypting text:', error);
    throw new Error('Failed to decrypt text - invalid password or corrupted data');
  }
};

/**
 * Check if text appears to be encrypted (base64 with sufficient length)
 * @param {string} text - Text to check
 * @returns {boolean} - True if appears encrypted
 */
export const isEncrypted = (text) => {
  try {
    // Check if it's valid base64 and long enough to contain salt + iv + data
    const minLength = Math.ceil(((ENCRYPTION_CONFIG.saltLength + ENCRYPTION_CONFIG.ivLength + 16) * 4) / 3);
    return text.length >= minLength && /^[A-Za-z0-9+/]*={0,2}$/.test(text);
  } catch {
    return false;
  }
};

/**
 * Encrypt an object (for structured data like paste metadata)
 * @param {Object} obj - Object to encrypt
 * @param {string} password - User password
 * @returns {Promise<string>} - Base64 encoded encrypted object
 */
export const encryptObject = async (obj, password) => {
  return await encryptText(JSON.stringify(obj), password);
};

/**
 * Decrypt an object
 * @param {string} encryptedData - Base64 encoded encrypted object
 * @param {string} password - User password
 * @returns {Promise<Object>} - Decrypted object
 */
export const decryptObject = async (encryptedData, password) => {
  const decryptedString = await decryptText(encryptedData, password);
  return JSON.parse(decryptedString);
};

// Export configuration for debugging/testing
export const getEncryptionConfig = () => ({ ...ENCRYPTION_CONFIG });