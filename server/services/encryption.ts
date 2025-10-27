/**
 * Encryption Service for Sensitive Data (SSN/FEIN)
 * Uses AES-256-GCM encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Get encryption key from environment variable
 * In production, this should be stored securely (e.g., AWS KMS, Azure Key Vault)
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return key;
}

/**
 * Derive a key from the master key and salt
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data
 * @param plaintext - The data to encrypt (SSN, FEIN, etc.)
 * @returns Encrypted string in format: salt:iv:tag:ciphertext (base64 encoded)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    return '';
  }

  const masterKey = getEncryptionKey();
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(masterKey, salt);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const tag = cipher.getAuthTag();
  
  // Combine salt, iv, tag, and encrypted data
  const result = `${salt.toString('base64')}:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
  
  return result;
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted string in format: salt:iv:tag:ciphertext
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    return '';
  }

  try {
    const masterKey = getEncryptionKey();
    const parts = encryptedData.split(':');
    
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltB64, ivB64, tagB64, ciphertext] = parts;
    
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const key = deriveKey(masterKey, salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data: Invalid key or corrupted data');
  }
}

/**
 * Mask sensitive data for display (e.g., SSN: ***-**-1234)
 */
export function maskSSN(ssn: string): string {
  if (!ssn) return '';
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) return '***-**-****';
  return `***-**-${cleaned.slice(-4)}`;
}

/**
 * Mask EIN for display (e.g., EIN: **-***1234)
 */
export function maskEIN(ein: string): string {
  if (!ein) return '';
  const cleaned = ein.replace(/\D/g, '');
  if (cleaned.length !== 9) return '**-*******';
  return `**-***${cleaned.slice(-4)}`;
}

/**
 * Validate SSN format
 */
export function validateSSN(ssn: string): boolean {
  const cleaned = ssn.replace(/\D/g, '');
  return cleaned.length === 9 && /^\d{9}$/.test(cleaned);
}

/**
 * Validate EIN format
 */
export function validateEIN(ein: string): boolean {
  const cleaned = ein.replace(/\D/g, '');
  return cleaned.length === 9 && /^\d{9}$/.test(cleaned);
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
  try {
    const key = process.env.ENCRYPTION_KEY;
    return !!key && key.length >= 32;
  } catch {
    return false;
  }
}
