import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password) => {
  try {
    // Generate salt and hash password with 12 rounds (secure but not too slow)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify a password against a hash
 * @param {string} password - The plain text password
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 */
export const verifyPassword = async (password, hash) => {
  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw new Error('Failed to verify password');
  }
};

/**
 * Check if a string is already a bcrypt hash
 * @param {string} str - The string to check
 * @returns {boolean} - True if it's a bcrypt hash, false otherwise
 */
export const isBcryptHash = (str) => {
  // Bcrypt hashes start with $2a$, $2b$, $2x$, or $2y$
  return /^\$2[abxy]\$\d+\$/.test(str);
};