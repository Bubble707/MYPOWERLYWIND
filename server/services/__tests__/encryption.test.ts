/**
 * Encryption Service Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, validateSSN, validateEIN, maskSSN, maskEIN } from '../encryption';

// Set encryption key for tests
beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-encryption-key-for-unit-tests-min-32-characters';
});

describe('Encryption Service', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const plaintext = '123-45-6789';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toContain(':'); // Should have salt:iv:tag:ciphertext format
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext', () => {
      const plaintext = '123-45-6789';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      expect(encrypted1).not.toBe(encrypted2); // Different IVs
      expect(decrypt(encrypted1)).toBe(decrypt(encrypted2)); // Same plaintext
    });

    it('should handle empty strings', () => {
      expect(encrypt('')).toBe('');
      expect(decrypt('')).toBe('');
    });

    it('should handle special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => decrypt('invalid-data')).toThrow();
    });
  });

  describe('validateSSN', () => {
    it('should validate correct SSN formats', () => {
      expect(validateSSN('123-45-6789')).toBe(true);
      expect(validateSSN('123456789')).toBe(true);
    });

    it('should reject invalid SSN formats', () => {
      expect(validateSSN('123-45-678')).toBe(false); // Too short
      expect(validateSSN('123-45-67890')).toBe(false); // Too long
      expect(validateSSN('abc-de-fghi')).toBe(false); // Non-numeric
      expect(validateSSN('')).toBe(false);
    });
  });

  describe('validateEIN', () => {
    it('should validate correct EIN formats', () => {
      expect(validateEIN('12-3456789')).toBe(true);
      expect(validateEIN('123456789')).toBe(true);
    });

    it('should reject invalid EIN formats', () => {
      expect(validateEIN('12-345678')).toBe(false); // Too short
      expect(validateEIN('12-34567890')).toBe(false); // Too long
      expect(validateEIN('ab-cdefghi')).toBe(false); // Non-numeric
      expect(validateEIN('')).toBe(false);
    });
  });

  describe('maskSSN', () => {
    it('should mask SSN correctly', () => {
      expect(maskSSN('123-45-6789')).toBe('***-**-6789');
      expect(maskSSN('123456789')).toBe('***-**-6789');
    });

    it('should handle invalid SSNs', () => {
      expect(maskSSN('')).toBe('');
      expect(maskSSN('123')).toBe('***-**-****');
    });
  });

  describe('maskEIN', () => {
    it('should mask EIN correctly', () => {
      expect(maskEIN('12-3456789')).toBe('**-***6789');
      expect(maskEIN('123456789')).toBe('**-***6789');
    });

    it('should handle invalid EINs', () => {
      expect(maskEIN('')).toBe('');
      expect(maskEIN('123')).toBe('**-*******');
    });
  });
});
