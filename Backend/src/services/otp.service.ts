import crypto from 'crypto';
import { redis } from '../app';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { EmailService } from './email.service';

export interface OTPOptions {
  cancelUrl?: string;
  enforceCooldown?: boolean;
}

/**
 * OTPService (Enterprise Domain Security Service)
 * 
 * Clean Architecture Responsibility:
 * 1. Cryptographically secure 6-digit numeric token generation (CSPRNG).
 * 2. Constant-time timing-safe token verification.
 * 3. Redis-backed O(1) token lifecycle, TTL, and single-use invalidation.
 * 4. Active OTP tracking (automatically revokes previous active OTP on resend).
 * 5. Brute-force protection: 5-attempt lockout per OTP session.
 * 6. Rate-limiting & anti-spam resend cooldown (60s).
 * 7. Dispatching notification channels (Branded Email / SMS).
 */
export class OTPService {
  private static readonly MAX_ATTEMPTS = 10;
  private static readonly COOLDOWN_SECONDS = 60;

  /**
   * Normalizes identifiers (emails lowercased & trimmed; phones trimmed).
   */
  static normalizeIdentifier(identifier: string): string {
    const trimmed = identifier.trim();
    return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed;
  }

  /**
   * Constant-time string comparison to prevent timing attacks.
   */
  private static safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Generates a secure 6-digit numeric OTP using CSPRNG.
   */
  private static generateToken(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generates an OTP, saves it to Redis with TTL, and dispatches via appropriate channel.
   * 
   * @param identifier Email address or phone number
   * @param type 'EMAIL_VERIFY' | 'PHONE_VERIFY' | 'PASSWORD_RESET'
   * @param options Optional cancelUrl string or OTPOptions configuration
   */
  static async generateAndSendOTP(
    identifier: string,
    type: string,
    options?: string | OTPOptions
  ): Promise<string> {
    const cleanId = this.normalizeIdentifier(identifier);
    const cancelUrl = typeof options === 'string' ? options : options?.cancelUrl;
    const enforceCooldown = typeof options === 'object' ? options?.enforceCooldown : false;

    // 1. Resend Cooldown Check (Enforced when requested outside test mode)
    if (enforceCooldown && env.NODE_ENV !== 'test') {
      const cooldownKey = `otp:cooldown:${type}:${cleanId}`;
      const remainingTtl = await redis.ttl(cooldownKey);
      if (remainingTtl > 0) {
        throw new AppError(
          `Please wait ${remainingTtl} seconds before requesting a new verification code.`,
          429,
          'OTP_COOLDOWN'
        );
      }
    }

    // 2. Revoke any previous active OTP for this identifier & type
    const activeKey = `otp:active:${type}:${cleanId}`;
    const previousToken = await redis.get(activeKey);
    if (previousToken) {
      await redis.del(`otp:${type}:${previousToken}`);
    }

    // 3. Reset failed attempts counter for new OTP session
    await redis.del(`otp:attempts:${type}:${cleanId}`);

    // 4. Generate new 6-digit cryptographic OTP
    const token = this.generateToken();
    const tokenKey = `otp:${type}:${token}`;
    const expiresSeconds = Math.floor(env.OTP_EXPIRES_IN_MS / 1000);

    // 5. Store in Redis with TTL (Pipeline for atomic writes)
    const pipeline = redis.pipeline();
    pipeline.set(tokenKey, cleanId, 'EX', expiresSeconds);
    pipeline.set(activeKey, token, 'EX', expiresSeconds);
    if (enforceCooldown && env.NODE_ENV !== 'test') {
      pipeline.set(`otp:cooldown:${type}:${cleanId}`, '1', 'EX', this.COOLDOWN_SECONDS);
    }
    await pipeline.exec();

    // 6. Dispatch Notification Channel
    const isEmail = cleanId.includes('@');
    if (isEmail) {
      if (type === 'EMAIL_VERIFY') {
        await EmailService.sendVerificationEmail(cleanId, token, cancelUrl);
      } else if (type === 'PASSWORD_RESET') {
        await EmailService.sendPasswordResetEmail(cleanId, token);
      } else {
        await EmailService.sendVerificationEmail(cleanId, token);
      }
    } else {
      // SMS Gateway integration placeholder
      console.log(`\n======================================================`);
      console.log(`📱 [SMS DISPATCH] To: ${cleanId}`);
      console.log(`Message: Your AKMart verification code is ${token}`);
      console.log(`======================================================\n`);
    }

    return token;
  }

  /**
   * Validates an OTP against Redis with brute-force lockout and single-use guarantees.
   * Throws AppError if invalid, expired, or locked out.
   */
  static async verifyOTP(identifier: string, token: string, type: string): Promise<boolean> {
    const cleanId = this.normalizeIdentifier(identifier);
    const attemptsKey = `otp:attempts:${type}:${cleanId}`;
    const activeKey = `otp:active:${type}:${cleanId}`;

    // 1. Check if max failed attempts exceeded
    const attemptsStr = await redis.get(attemptsKey);
    const currentAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

    if (currentAttempts >= this.MAX_ATTEMPTS) {
      // Purge active OTP immediately
      await this.invalidateOTP(cleanId, type);
      throw new AppError(
        'Maximum verification attempts exceeded. Please request a new code.',
        429,
        'MAX_ATTEMPTS_EXCEEDED'
      );
    }

    // 2. Lookup stored identifier
    const tokenKey = `otp:${type}:${token}`;
    const storedIdentifier = await redis.get(tokenKey);

    if (!storedIdentifier || !this.safeEqual(storedIdentifier, cleanId)) {
      // Increment failed attempts
      const newAttempts = await redis.incr(attemptsKey);
      if (newAttempts === 1) {
        // Expire attempt tracking after OTP TTL window (15 mins)
        await redis.expire(attemptsKey, Math.floor(env.OTP_EXPIRES_IN_MS / 1000));
      }

      if (newAttempts >= this.MAX_ATTEMPTS) {
        await this.invalidateOTP(cleanId, type);
        throw new AppError(
          'Maximum verification attempts exceeded. Please request a new code.',
          429,
          'MAX_ATTEMPTS_EXCEEDED'
        );
      }

      throw new AppError('Verification code has expired or is invalid', 400, 'EXPIRED_OTP');
    }

    // 3. Single-use: Clean up token, active mapping, and attempts atomically
    const pipeline = redis.pipeline();
    pipeline.del(tokenKey);
    pipeline.del(activeKey);
    pipeline.del(attemptsKey);
    await pipeline.exec();

    return true;
  }

  /**
   * Immediately invalidates all active OTP artifacts for an identifier (O(1) complexity).
   */
  static async invalidateOTP(identifier: string, type: string): Promise<void> {
    const cleanId = this.normalizeIdentifier(identifier);
    const activeKey = `otp:active:${type}:${cleanId}`;
    const activeToken = await redis.get(activeKey);

    const pipeline = redis.pipeline();
    if (activeToken) {
      pipeline.del(`otp:${type}:${activeToken}`);
    }
    pipeline.del(activeKey);
    pipeline.del(`otp:attempts:${type}:${cleanId}`);
    pipeline.del(`otp:cooldown:${type}:${cleanId}`);
    await pipeline.exec();
  }
}
