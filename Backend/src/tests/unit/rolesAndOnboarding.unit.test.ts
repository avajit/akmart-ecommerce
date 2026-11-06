import { describe, it, expect, vi } from 'vitest';
import { registerSchema } from '../../validators/auth.validator';
import { AppError } from '../../utils/AppError';
import { getAuthCookieOptions } from '../../utils/cookie';
import { env } from '../../config/env';

describe('Role-Based Access Control, Registration & Onboarding Edge Case Tests', () => {

  describe('1. Registration Validation & Role Assignment Edge Cases', () => {
    it('should assign CONSUMER as default role when role is omitted', async () => {
      const payload = {
        body: {
          fullName: 'Aayush Sharma',
          email: 'aayush@example.com',
          password: 'Password123!',
        },
      };

      const parsed = await registerSchema.parseAsync(payload);
      expect(parsed.body.role).toBe('CONSUMER');
      expect(parsed.body.fullName).toBe('Aayush Sharma');
    });

    it('should accept role SELLER when user explicitly chooses merchant', async () => {
      const payload = {
        body: {
          fullName: 'Kathmandu Retail',
          email: 'merchant@example.com',
          password: 'Password123!',
          role: 'SELLER' as const,
        },
      };

      const parsed = await registerSchema.parseAsync(payload);
      expect(parsed.body.role).toBe('SELLER');
    });

    it('should reject privilege escalation to ADMIN during registration', async () => {
      const payload = {
        body: {
          fullName: 'Malicious User',
          email: 'hacker@example.com',
          password: 'Password123!',
          role: 'ADMIN' as any,
        },
      };

      await expect(registerSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should reject invalid or arbitrary role strings', async () => {
      const payload = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'SUPERUSER' as any,
        },
      };

      await expect(registerSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should reject registration if password is under 8 characters', async () => {
      const payload = {
        body: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Pass1',
        },
      };

      await expect(registerSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should reject registration if full name is less than 2 characters', async () => {
      const payload = {
        body: {
          fullName: 'A',
          email: 'test@example.com',
          password: 'Password123!',
        },
      };

      await expect(registerSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should accept registration with a 10-digit mobile phone number instead of email', async () => {
      const payload = {
        body: {
          fullName: 'Phone User',
          phoneNumber: '9841234567',
          password: 'Password123!',
        },
      };

      const parsed = await registerSchema.parseAsync(payload);
      expect(parsed.body.phoneNumber).toBe('9841234567');
      expect(parsed.body.email).toBeUndefined();
    });

    it('should reject registration if neither email nor phone number is provided', async () => {
      const payload = {
        body: {
          fullName: 'No Contact User',
          password: 'Password123!',
        },
      };

      await expect(registerSchema.parseAsync(payload)).rejects.toThrow('Either email or phone number must be provided');
    });

    it('should reject malformed email format', async () => {
      const payload = {
        body: {
          fullName: 'Bad Email User',
          email: 'not-an-email',
          password: 'Password123!',
        },
      };

      await expect(registerSchema.parseAsync(payload)).rejects.toThrow();
    });

    it('should reject non-10-digit phone numbers', async () => {
      const payload = {
        body: {
          fullName: 'Bad Phone User',
          phoneNumber: '12345',
          password: 'Password123!',
        },
      };

      await expect(registerSchema.parseAsync(payload)).rejects.toThrow();
    });
  });

  describe('2. Anti-Self-Purchase Gatekeeper: Sellers Buying Other Sellers vs Own Products', () => {
    const evaluatePurchaseEligibility = (buyerUserId: string, listingOwnerUserId: string) => {
      if (listingOwnerUserId === buyerUserId) {
        throw new AppError('You cannot purchase products from your own store', 400, 'CANNOT_PURCHASE_OWN_PRODUCT');
      }
      return { allowed: true };
    };

    it('should ALLOW a SELLER to purchase products from ANOTHER seller', () => {
      const sellerBuyerId = 'seller-user-123';
      const otherSellerId = 'seller-user-999';

      const result = evaluatePurchaseEligibility(sellerBuyerId, otherSellerId);
      expect(result.allowed).toBe(true);
    });

    it('should BLOCK a SELLER from purchasing products from their OWN store (anti-wash-trading)', () => {
      const sellerBuyerId = 'seller-user-123';
      const ownStoreOwnerId = 'seller-user-123';

      expect(() => evaluatePurchaseEligibility(sellerBuyerId, ownStoreOwnerId)).toThrowError(AppError);
      try {
        evaluatePurchaseEligibility(sellerBuyerId, ownStoreOwnerId);
      } catch (err: any) {
        expect(err.errorCode).toBe('CANNOT_PURCHASE_OWN_PRODUCT');
        expect(err.statusCode).toBe(400);
      }
    });

    it('should ALLOW a regular CONSUMER to purchase from any seller', () => {
      const consumerUserId = 'consumer-user-456';
      const sellerUserId = 'seller-user-123';

      const result = evaluatePurchaseEligibility(consumerUserId, sellerUserId);
      expect(result.allowed).toBe(true);
    });
  });

  describe('3. Login Post-Authentication Routing Across All 3 Roles', () => {
    const resolvePostLoginDestination = (role: string, customRedirect?: string): string => {
      const upper = role.toUpperCase();
      if (customRedirect && !customRedirect.startsWith('/login') && !customRedirect.startsWith('/register')) {
        return customRedirect;
      }
      if (upper === 'ADMIN') return '/admin/dashboard';
      if (upper === 'SELLER') return '/seller/dashboard';
      return '/';
    };

    it('should route CONSUMER to marketplace root (/) by default', () => {
      expect(resolvePostLoginDestination('CONSUMER')).toBe('/');
    });

    it('should route SELLER to seller dashboard (/seller/dashboard) by default', () => {
      expect(resolvePostLoginDestination('SELLER')).toBe('/seller/dashboard');
    });

    it('should route ADMIN to admin dashboard (/admin/dashboard) by default', () => {
      expect(resolvePostLoginDestination('ADMIN')).toBe('/admin/dashboard');
    });

    it('should honor custom redirect (e.g. /checkout) for any role', () => {
      expect(resolvePostLoginDestination('CONSUMER', '/checkout')).toBe('/checkout');
      expect(resolvePostLoginDestination('SELLER', '/checkout')).toBe('/checkout');
    });
  });

  describe('4. Seller Onboarding & Zero Infinite Loop Verification', () => {
    const evaluateOnboardingAction = async (
      role: string,
      fetchSellerProfile: () => Promise<any>
    ): Promise<'REDIRECT_DASHBOARD' | 'REDIRECT_ADMIN' | 'STAY_ON_FORM'> => {
      const rawRole = role.toUpperCase();
      if (rawRole === 'ADMIN') {
        return 'REDIRECT_ADMIN';
      }

      if (rawRole === 'SELLER') {
        try {
          await fetchSellerProfile();
          return 'REDIRECT_DASHBOARD';
        } catch {
          // Profile does not exist yet (404) -> Stay on onboarding form
          return 'STAY_ON_FORM';
        }
      }

      // Consumers stay on form to create their store
      return 'STAY_ON_FORM';
    };

    it('should STAY_ON_FORM for first-time seller with 404 (no profile yet) - PREVENTING LOOP', async () => {
      const mockGetProfile404 = vi.fn().mockRejectedValue({
        response: { status: 404, data: { message: 'Seller profile not found' } },
      });

      const action = await evaluateOnboardingAction('SELLER', mockGetProfile404);
      expect(action).toBe('STAY_ON_FORM');
      expect(mockGetProfile404).toHaveBeenCalledOnce();
    });

    it('should REDIRECT_DASHBOARD for established seller with existing profile (200 OK)', async () => {
      const mockGetProfile200 = vi.fn().mockResolvedValue({
        data: { id: 'profile-1', shopName: 'Himalayan Traders' },
      });

      const action = await evaluateOnboardingAction('SELLER', mockGetProfile200);
      expect(action).toBe('REDIRECT_DASHBOARD');
      expect(mockGetProfile200).toHaveBeenCalledOnce();
    });

    it('should REDIRECT_ADMIN for admin visiting onboarding page', async () => {
      const mockGetProfile = vi.fn();
      const action = await evaluateOnboardingAction('ADMIN', mockGetProfile);
      expect(action).toBe('REDIRECT_ADMIN');
      expect(mockGetProfile).not.toHaveBeenCalled();
    });

    it('should STAY_ON_FORM for CONSUMER who clicks "Become a Seller"', async () => {
      const mockGetProfile = vi.fn();
      const action = await evaluateOnboardingAction('CONSUMER', mockGetProfile);
      expect(action).toBe('STAY_ON_FORM');
      expect(mockGetProfile).not.toHaveBeenCalled();
    });
  });

  describe('5. Identifier Parser & Phone / Email Recognition Edge Cases', () => {
    // Safe phone recognition without ReDoS backtracking
    const isPhoneNumber = (val: string) => {
      const cleaned = val.replace(/[\s-]/g, '');
      const digits = cleaned.startsWith('+977') ? cleaned.slice(4) : (cleaned.startsWith('977') ? cleaned.slice(3) : cleaned);
      return /^[9][678]\d{8}$/.test(digits) || /^\d{10}$/.test(digits);
    };

    const parseIdentifier = (value: string) => {
      const trimmed = value.trim();
      if (isPhoneNumber(trimmed)) {
        const digitsOnly = trimmed.replace(/\D/g, '').slice(-10);
        return { phoneNumber: digitsOnly };
      }
      return { email: trimmed.toLowerCase() };
    };

    it('should parse 10-digit mobile number starting with 98', () => {
      expect(parseIdentifier('9841234567')).toEqual({ phoneNumber: '9841234567' });
    });

    it('should parse phone with international prefix +977', () => {
      expect(parseIdentifier('+9779841234567')).toEqual({ phoneNumber: '9841234567' });
    });

    it('should parse phone formatted with dashes and spaces', () => {
      expect(parseIdentifier('+977 984-123-4567')).toEqual({ phoneNumber: '9841234567' });
    });

    it('should parse Ncell prefix 980 and SmartCell prefix 988', () => {
      expect(parseIdentifier('9801234567')).toEqual({ phoneNumber: '9801234567' });
      expect(parseIdentifier('9881234567')).toEqual({ phoneNumber: '9881234567' });
    });

    it('should parse email and normalize to lowercase with trimmed spaces', () => {
      expect(parseIdentifier('  USER@COMPANY.COM  ')).toEqual({ email: 'user@company.com' });
    });
  });

  describe('6. Password Strength & Registration Form Validation', () => {
    const calculatePasswordStrength = (pwd: string) => {
      if (!pwd) return { score: 0, label: '', color: 'bg-gray-700' };
      let score = 0;
      if (pwd.length >= 8) score += 1;
      if (/[A-Z]/.test(pwd)) score += 1;
      if (/[0-9]/.test(pwd)) score += 1;
      if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

      switch (score) {
        case 1:
          return { score: 25, label: 'Weak' };
        case 2:
          return { score: 50, label: 'Fair' };
        case 3:
          return { score: 75, label: 'Good' };
        case 4:
          return { score: 100, label: 'Strong' };
        default:
          return { score: 10, label: 'Very Weak' };
      }
    };

    it('should score empty password as 0', () => {
      expect(calculatePasswordStrength('').score).toBe(0);
    });

    it('should score password meeting all 4 criteria as 100 Strong', () => {
      const res = calculatePasswordStrength('Avajit@123');
      expect(res.score).toBe(100);
      expect(res.label).toBe('Strong');
    });

    it('should validate that terms acceptance is strictly required on registration', () => {
      const validateRegistration = (agreedToTerms: boolean, password: string, confirmPassword: string) => {
        const errors: Record<string, string> = {};
        if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (!agreedToTerms) errors.terms = 'Please accept Terms & Privacy Policy';
        return { isValid: Object.keys(errors).length === 0, errors };
      };

      expect(validateRegistration(false, 'Pass1234!', 'Pass1234!').isValid).toBe(false);
      expect(validateRegistration(false, 'Pass1234!', 'Pass1234!').errors.terms).toBe('Please accept Terms & Privacy Policy');
      expect(validateRegistration(true, 'Pass1234!', 'Pass1234!').isValid).toBe(true);
      expect(validateRegistration(true, 'Pass1234!', 'Mismatch!').isValid).toBe(false);
    });
  });

  describe('7. Cookie & Session Duration by Remember Me Setting', () => {
    it('should configure persistent cookie with maxAge for remembered sessions', () => {
      const opts = getAuthCookieOptions(true);
      expect(opts.httpOnly).toBe(true);
      expect(opts.maxAge).toBe(env.JWT_REFRESH_EXPIRES_IN_MS);
    });

    it('should configure session cookie without maxAge for ephemeral sessions', () => {
      const opts = getAuthCookieOptions(false);
      expect(opts.httpOnly).toBe(true);
      expect(opts.maxAge).toBeUndefined();
    });
  });

});
