import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { prisma, redis } from '../app';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export class OTPService {
  private static getTransporter() {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: env.SMTP_USER && env.SMTP_PASS ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      } : undefined,
    });
  }

  /**
   * Generates a 6-digit numeric OTP.
   */
  private static generateToken(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Sends an email via Nodemailer. If using Ethereal, prints the preview URL.
   */
  static async sendEmail(to: string, subject: string, html: string) {
    if (env.NODE_ENV === 'test') return; // Bypass real network calls in tests
    
    // If developer hasn't set up real Ethereal credentials yet, mock the email to the console!
    if (!env.SMTP_USER || env.SMTP_USER === 'your_ethereal_user@ethereal.email') {
      console.log(`\n======================================================`);
      console.log(`📧 [EMAIL MOCK] To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content (HTML stripped): ${html.replace(/<[^>]*>?/gm, '')}`);
      console.log(`======================================================\n`);
      return;
    }

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
      });

      console.log(`[EMAIL SENT] to ${to}. Message ID: ${info.messageId}`);
      
      // If using Ethereal Email for testing, print the preview URL
      if (env.SMTP_HOST.includes('ethereal')) {
        console.log(`[ETHEREAL PREVIEW URL] 🔗 ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send email:', error);
      throw new AppError('Failed to send email notification', 500, 'EMAIL_FAILED');
    }
  }

  /**
   * Generates an OTP, saves it to Redis, and sends it to the user.
   * Type can be: 'EMAIL_VERIFY', 'PHONE_VERIFY', 'PASSWORD_RESET'
   */
  static async generateAndSendOTP(identifier: string, type: string) {
    // 1. Generate a new 6-digit OTP
    const token = this.generateToken();
    const redisKey = `otp:${type}:${token}`;

    // 2. Save to Redis with an expiration (15 minutes). 
    // We store the identifier as the value so we know WHO this token belongs to!
    const expiresSeconds = Math.floor(env.OTP_EXPIRES_IN_MS / 1000);
    await redis.set(redisKey, identifier, 'EX', expiresSeconds);

    // 3. Send the OTP
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      let subject = '';
      let html = '';

      if (type === 'EMAIL_VERIFY') {
        subject = 'Welcome to AKMart! Verify your email';
        html = `<h1>Email Verification</h1><p>Your verification code is: <strong>${token}</strong></p><p>This code will expire in 15 minutes.</p>`;
      } else if (type === 'PASSWORD_RESET') {
        subject = 'AKMart - Password Reset';
        html = `<h1>Password Reset</h1><p>Your password reset code is: <strong>${token}</strong></p><p>This code will expire in 15 minutes.</p>`;
      } else {
        subject = 'AKMart - Verification Code';
        html = `<p>Your code is: <strong>${token}</strong></p>`;
      }

      await this.sendEmail(identifier, subject, html);
    } else {
      // It's a phone number. We don't have an SMS provider yet, so we mock it.
      console.log(`\n======================================================`);
      console.log(`📱 [SMS MOCK] To: ${identifier}`);
      console.log(`Message: Your AKMart verification code is ${token}`);
      console.log(`======================================================\n`);
    }
  }

  /**
   * Validates an OTP against Redis and deletes it if successful.
   * Throws AppError if invalid or expired.
   */
  static async verifyOTP(identifier: string, token: string, type: string) {
    const redisKey = `otp:${type}:${token}`;
    const storedIdentifier = await redis.get(redisKey);

    if (!storedIdentifier) {
      throw new AppError('Verification code has expired or is invalid', 400, 'EXPIRED_OTP');
    }

    if (storedIdentifier !== identifier) {
      throw new AppError('This verification code does not belong to you', 400, 'INVALID_OTP');
    }

    // OTP is valid. Delete it from Redis so it cannot be reused.
    await redis.del(redisKey);

    return true;
  }
}
