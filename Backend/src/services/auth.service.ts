import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
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

    const roleName = data.role || env.DEFAULT_USER_ROLE;
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new AppError(`Role ${roleName} not found. Seed DB first.`, 500, 'ROLE_NOT_FOUND');

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
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError('Google SSO is not configured on the server', 500, 'SERVER_ERROR');
    }

    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    
    let googleEmail: string | undefined;
    let googleSub: string | undefined;
    let googleName: string | undefined;
    let googlePicture: string | undefined;

    try {
      // getTokenInfo works with access_token from the @react-oauth/google popup flow.
      // It calls Google's tokeninfo endpoint to validate and decode the token.
      const tokenInfo = await client.getTokenInfo(data.idToken);
      googleEmail = tokenInfo.email;
      googleSub = tokenInfo.sub;
      // name and picture are not returned by tokeninfo — we'll use email as fallback
    } catch (error) {
      throw new AppError('Invalid Google Token', 401, 'UNAUTHORIZED');
    }

    if (!googleEmail || !googleSub) {
      throw new AppError('Invalid Google Token Payload', 401, 'UNAUTHORIZED');
    }

    // Build a payload-like object for the rest of the logic
    const payload = { email: googleEmail, sub: googleSub, name: googleName, picture: googlePicture };

    // 1. Check if user already exists with this googleId
    let user = await prisma.user.findUnique({
      where: { googleId: payload.sub },
      include: { role: true }
    });

    if (!user) {
      // 2. Check if user exists with the same email (Account Linking)
      user = await prisma.user.findUnique({
        where: { email: payload.email },
        include: { role: true }
      });

      if (user) {
        // Link existing account to Google
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId: payload.sub, 
            avatarUrl: user.avatarUrl || payload.picture, // Only override if they don't have one
            isEmailVerified: true // Google guarantees the email is verified
          },
          include: { role: true }
        });
      } else {
        // 3. Create a brand new account
        const role = await prisma.role.findUnique({ where: { name: env.DEFAULT_USER_ROLE } });
        if (!role) throw new AppError('Default role not found', 500, 'ROLE_NOT_FOUND');

        user = await prisma.user.create({
          data: {
            fullName: payload.name || 'Google User',
            email: payload.email,
            googleId: payload.sub,
            avatarUrl: payload.picture,
            isEmailVerified: true, // Google already verified it
            roleId: role.id,
            // passwordHash is left null implicitly!
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

    if (!user.passwordHash) {
      throw new AppError('This account is registered via Google Sign-In and does not have a password.', 400, 'NO_PASSWORD_SET');
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

  static async verifyAccount(identifier: string, token: string, deviceInfo: string, ip: string) {
    const isEmail = identifier.includes('@');
    const type = isEmail ? 'EMAIL_VERIFY' : 'PHONE_VERIFY';

    await OTPService.verifyOTP(identifier, token, type);

    const updateData = isEmail ? { isEmailVerified: true } : { isPhoneVerified: true };
    
    // Update and return the full user since we need to generate tokens
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phoneNumber: identifier },
      include: { role: true }
    });

    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    // Auto-login the user
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

  static async resendOTP(identifier: string) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phoneNumber: identifier }] }
    });

    if (!user) {
      // Don't leak if user exists
      return; 
    }

    const isEmail = identifier.includes('@');
    if (isEmail && user.isEmailVerified) throw new AppError('Email is already verified', 400, 'ALREADY_VERIFIED');
    if (!isEmail && user.isPhoneVerified) throw new AppError('Phone is already verified', 400, 'ALREADY_VERIFIED');

    const type = isEmail ? 'EMAIL_VERIFY' : 'PHONE_VERIFY';
    await OTPService.generateAndSendOTP(identifier, type);
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
