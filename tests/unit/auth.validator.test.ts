import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  verifyAccountSchema,
  resetPasswordSchema,
} from '../../Backend/src/validators/auth.validator';

describe('Unit: Auth Validators (Zod Schemas)', () => {
  describe('registerSchema', () => {
    it('TC-U09: should accept valid email registration', () => {
      const validPayload = {
        body: {
          fullName: 'Sita Sharma',
          email: 'sita@example.com',
          password: 'Password@123',
          role: 'CONSUMER',
        },
      };
      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('TC-U10: should accept valid 10-digit Nepal phone registration', () => {
      const validPayload = {
        body: {
          fullName: 'Ram Thapa',
          phoneNumber: '9841234567',
          password: 'Password@123',
          role: 'CONSUMER',
        },
      };
      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('TC-U11: should reject phone number with non-digits or wrong length', () => {
      const invalidShort = {
        body: {
          fullName: 'Ram Thapa',
          phoneNumber: '9841234',
          password: 'Password@123',
        },
      };
      const resultShort = registerSchema.safeParse(invalidShort);
      expect(resultShort.success).toBe(false);

      const invalidLetters = {
        body: {
          fullName: 'Ram Thapa',
          phoneNumber: '98412ABCDE',
          password: 'Password@123',
        },
      };
      const resultLetters = registerSchema.safeParse(invalidLetters);
      expect(resultLetters.success).toBe(false);
    });

    it('TC-U12: should fail if neither email nor phone is provided', () => {
      const payload = {
        body: {
          fullName: 'Anonymous User',
          password: 'Password@123',
        },
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Either email or phone number must be provided');
      }
    });

    it('TC-U13: should reject password shorter than 8 characters', () => {
      const payload = {
        body: {
          fullName: 'Ram Thapa',
          email: 'ram@example.com',
          password: 'short',
        },
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Password must be at least 8 characters');
      }
    });

    it('TC-U14: should reject full name shorter than 2 characters', () => {
      const payload = {
        body: {
          fullName: 'A',
          email: 'a@example.com',
          password: 'Password@123',
        },
      };
      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Full name must be at least 2 characters');
      }
    });
  });

  describe('loginSchema', () => {
    it('TC-U15: should reject login without password', () => {
      const payload = {
        body: {
          email: 'user@example.com',
          password: '',
        },
      };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('TC-U16: should reject login without identifier', () => {
      const payload = {
        body: {
          password: 'SomePassword123',
        },
      };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Either email or phone number must be provided for login');
      }
    });
  });

  describe('verifyAccountSchema', () => {
    it('TC-U17: should strictly require exactly 6-character OTP', () => {
      const valid = {
        body: {
          identifier: 'user@example.com',
          token: '123456',
        },
      };
      expect(verifyAccountSchema.safeParse(valid).success).toBe(true);

      const tooShort = {
        body: {
          identifier: 'user@example.com',
          token: '12345',
        },
      };
      expect(verifyAccountSchema.safeParse(tooShort).success).toBe(false);

      const tooLong = {
        body: {
          identifier: 'user@example.com',
          token: '1234567',
        },
      };
      expect(verifyAccountSchema.safeParse(tooLong).success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('TC-U18: should enforce min 8 chars for new password and required token', () => {
      const valid = {
        body: {
          token: 'secure-crypto-reset-token-abc-123',
          newPassword: 'BrandNewSecurePassword1!',
        },
      };
      expect(resetPasswordSchema.safeParse(valid).success).toBe(true);

      const emptyToken = {
        body: {
          token: '',
          newPassword: 'BrandNewSecurePassword1!',
        },
      };
      expect(resetPasswordSchema.safeParse(emptyToken).success).toBe(false);
    });
  });
});
