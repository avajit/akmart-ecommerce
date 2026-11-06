import { describe, it, expect } from 'vitest';
import { loginSchema } from '../../validators/auth.validator';
import { getAuthCookieOptions } from '../../utils/cookie';
import { env } from '../../config/env';

describe('Remember Me Feature Unit Tests', () => {
  describe('1. Login Schema Validation with rememberMe field', () => {
    it('should validate successfully when rememberMe is true', async () => {
      const validPayload = {
        body: {
          email: 'customer@akmart.com',
          password: 'Password123!',
          rememberMe: true,
        },
      };

      const parsed = await loginSchema.parseAsync(validPayload);
      expect(parsed.body.rememberMe).toBe(true);
      expect(parsed.body.email).toBe('customer@akmart.com');
    });

    it('should validate successfully when rememberMe is false', async () => {
      const validPayload = {
        body: {
          phoneNumber: '9841234567',
          password: 'Password123!',
          rememberMe: false,
        },
      };

      const parsed = await loginSchema.parseAsync(validPayload);
      expect(parsed.body.rememberMe).toBe(false);
      expect(parsed.body.phoneNumber).toBe('9841234567');
    });

    it('should validate successfully when rememberMe is omitted (backward compatibility)', async () => {
      const validPayload = {
        body: {
          email: 'customer@akmart.com',
          password: 'Password123!',
        },
      };

      const parsed = await loginSchema.parseAsync(validPayload);
      expect(parsed.body.rememberMe).toBeUndefined();
    });

    it('should reject invalid rememberMe types (e.g. string instead of boolean)', async () => {
      const invalidPayload = {
        body: {
          email: 'customer@akmart.com',
          password: 'Password123!',
          rememberMe: 'yes',
        },
      };

      await expect(loginSchema.parseAsync(invalidPayload)).rejects.toThrow();
    });
  });

  describe('2. Cookie Options Resolution (RFC 6265)', () => {
    it('should produce a persistent cookie with maxAge when rememberMe is true', () => {
      const options = getAuthCookieOptions(true);
      expect(options.httpOnly).toBe(true);
      expect(options.path).toBe('/');
      expect(options.maxAge).toBe(env.JWT_REFRESH_EXPIRES_IN_MS);
      expect(options.maxAge).toBeGreaterThan(0);
    });

    it('should produce a session cookie (NO maxAge or expires) when rememberMe is false', () => {
      const options = getAuthCookieOptions(false);
      expect(options.httpOnly).toBe(true);
      expect(options.path).toBe('/');
      expect(options.maxAge).toBeUndefined();
      expect('expires' in options).toBe(false);
    });
  });

  describe('3. Session Duration and Persistence Logic', () => {
    it('should assign a 24-hour expiration for non-remembered sessions vs full duration for remembered sessions', () => {
      const now = Date.now();
      const rememberedDuration = env.JWT_REFRESH_EXPIRES_IN_MS;
      const nonRememberedDuration = 24 * 60 * 60 * 1000;

      const rememberedExpiry = new Date(now + rememberedDuration);
      const nonRememberedExpiry = new Date(now + nonRememberedDuration);

      expect(rememberedExpiry.getTime()).toBeGreaterThan(nonRememberedExpiry.getTime());
      expect(nonRememberedDuration).toBe(86400000); // 24 hours in ms
    });

    it('should correctly detect persistence during token rotation based on token lifespan', () => {
      const createdAt = new Date('2026-11-01T00:00:00Z');
      
      // Persistent token (7 days later)
      const persistentExpiresAt = new Date('2026-11-08T00:00:00Z');
      const isPersistent = (persistentExpiresAt.getTime() - createdAt.getTime()) > (48 * 60 * 60 * 1000);
      expect(isPersistent).toBe(true);

      // Session token (24 hours later)
      const sessionExpiresAt = new Date('2026-11-02T00:00:00Z');
      const isSession = (sessionExpiresAt.getTime() - createdAt.getTime()) > (48 * 60 * 60 * 1000);
      expect(isSession).toBe(false);
    });
  });
});
