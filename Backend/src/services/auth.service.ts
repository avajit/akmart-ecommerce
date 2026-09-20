import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma, redis } from '../app';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { RegisterRequestDTO, GoogleSSORequestDTO, ForgotPasswordRequestDTO, ResetPasswordRequestDTO } from '../validators/auth.validator';
import { env } from '../config/env';
import { OTPService } from './otp.service';
import { SessionService } from './session.service';

export class AuthService {

  static async register(data: RegisterRequestDTO & { googleId?: string }) {
    if (data.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) throw new AppError('Email is already registered', 400, 'EMAIL_EXISTS');
    }
    if (data.phoneNumber) {
      const existingUser = await prisma.user.findUnique({ where: { phoneNumber: data.phoneNumber } });
      if (existingUser) throw new AppError('Phone number is already registered', 400, 'PHONE_EXISTS');
    }

    const role = await prisma.role.findUnique({ where: { name: env.DEFAULT_USER_ROLE } });
    if (!role) throw new AppError(`Default role ${env.DEFAULT_USER_ROLE} not found. Seed DB first.`, 500, 'ROLE_NOT_FOUND');

    let passwordHash = null;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
    }

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        googleId: data.googleId,
        roleId: role.id,
        // Ensure standard users start unverified
        isEmailVerified: !!data.googleId, 
        isPhoneVerified: false,
      },
    });

    // Send Verification OTP instantly if they registered with email or phone
    if (!data.googleId) {
      if (data.email) {
        await OTPService.generateAndSendOTP(data.email, 'EMAIL_VERIFY');
      } else if (data.phoneNumber) {
        await OTPService.generateAndSendOTP(data.phoneNumber, 'PHONE_VERIFY');
      }
    }

    return user;
  }

  static async login(identifier: string, password: string, deviceInfo: string, ip: string) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] },
      include: { role: true },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED');
    }

    // Check if account is verified (either email or phone)
    if (!user.isEmailVerified && !user.isPhoneVerified && !user.googleId) {
      throw new AppError('Account not verified. Please verify your email or phone number first.', 403, 'UNVERIFIED_ACCOUNT');
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.roleId);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        deviceInfo: deviceInfo || ip,
        expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_MS),
      },
    });

    return { user, accessToken, refreshToken };
  }

  static async rotateRefreshToken(oldToken: string, deviceInfo: string, ip: string) {
    const tokenHash = crypto.createHash('sha256').update(oldToken).digest('hex');
    
    const existingToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existingToken || existingToken.revokedAt || existingToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token. Please login again.', 401, 'INVALID_REFRESH_TOKEN');
    }

    if (!existingToken.user.isActive) {
      throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(existingToken.userId, existingToken.user.roleId);
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: existingToken.userId,
        deviceInfo: deviceInfo || ip,
        expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_MS),
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async logout(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static async googleSSO(data: GoogleSSORequestDTO, ip: string) {
    // MOCK: Verify ID Token with Google (Skipped for v1, assume valid token returns payload)
    // const payload = await verifyGoogleToken(data.idToken);
    const mockGooglePayload = {
      sub: 'google_12345',
      email: 'google@example.com',
      name: 'Google User',
      picture: 'https://avatar.com/google.png'
    };

    let user = await prisma.user.findUnique({
      where: { googleId: mockGooglePayload.sub },
      include: { role: true }
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: mockGooglePayload.email },
        include: { role: true }
      });

      if (user) {
        // Link existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: mockGooglePayload.sub, avatarUrl: mockGooglePayload.picture },
          include: { role: true }
        });
      } else {
        // Create new account
        const role = await prisma.role.findUnique({ where: { name: env.DEFAULT_USER_ROLE } });
        if (!role) throw new AppError('Default role not found', 500, 'ROLE_NOT_FOUND');

        user = await prisma.user.create({
          data: {
            fullName: mockGooglePayload.name,
            email: mockGooglePayload.email,
            googleId: mockGooglePayload.sub,
            avatarUrl: mockGooglePayload.picture,
            isEmailVerified: true,
            roleId: role.id
          },
          include: { role: true }
        });
      }
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED');
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.roleId);
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        deviceInfo: data.deviceInfo || ip,
        expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_MS),
      },
    });

    return { user, accessToken, refreshToken };
  }

  static async forgotPassword(data: ForgotPasswordRequestDTO) {
    const identifier = data.email || data.phoneNumber;
    if (!identifier) throw new AppError('Email or phone required', 400, 'INVALID_INPUT');

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] }
    });

    if (!user) {
      return; // Security: Don't reveal if user exists or not
    }

    await OTPService.generateAndSendOTP(identifier, 'PASSWORD_RESET');
  }

  static async resetPassword(data: ResetPasswordRequestDTO) {
    const redisKey = `otp:PASSWORD_RESET:${data.token}`;
    const identifier = await redis.get(redisKey);

    if (!identifier) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
    }

    // Verify it through OTP service to ensure it gets deleted properly
    await OTPService.verifyOTP(identifier, data.token, 'PASSWORD_RESET');

    const passwordHash = await bcrypt.hash(data.newPassword, env.BCRYPT_SALT_ROUNDS);

    await prisma.user.updateMany({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] },
      data: { passwordHash }
    });
  }

  static async verifyAccount(identifier: string, token: string) {
    const isEmail = identifier.includes('@');
    const type = isEmail ? 'EMAIL_VERIFY' : 'PHONE_VERIFY';

    await OTPService.verifyOTP(identifier, token, type);

    const updateData = isEmail ? { isEmailVerified: true } : { isPhoneVerified: true };
    
    await prisma.user.updateMany({
      where: isEmail ? { email: identifier } : { phoneNumber: identifier },
      data: updateData
    });
  }

  static async deleteAccount(userId: string) {
    // Soft delete the user account
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isActive: false, 
        deletedAt: new Date() 
      },
    });

    // Revoke all their active sessions
    await SessionService.revokeAllSessions(userId);
  }
}
