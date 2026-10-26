import { Request, Response, NextFunction } from 'express';
import { URL } from 'url';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { toUserResponseDTO, AuthResponseDTO } from '../dtos/auth.dto';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
  path: '/',
  maxAge: env.JWT_REFRESH_EXPIRES_IN_MS,
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email or phone for the verification code.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phoneNumber, password } = req.body;
    const identifier = email || phoneNumber;
    
    if (!identifier) {
      throw new AppError('Email or Phone number is required', 400);
    }

    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ip = req.ip || 'Unknown IP';

    const result = await AuthService.login(identifier, password, deviceInfo, ip);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    const responseData: AuthResponseDTO = {
      accessToken: result.accessToken,
      user: toUserResponseDTO(result.user),
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // CSRF Protection on Cookie-based refresh:
    const requestOrigin = (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer as string).origin : undefined);
    if (requestOrigin && env.NODE_ENV === 'production') {
      const cleanOrigin = requestOrigin.replace(/\/$/, '');
      const cleanFrontendUrl = env.FRONTEND_WEB_URL?.replace(/\/$/, '');
      const cleanMobileUrl = env.FRONTEND_MOBILE_URL?.replace(/\/$/, '');
      const isVercel = cleanOrigin.endsWith('.vercel.app');
      const isAllowed = cleanOrigin === cleanFrontendUrl || cleanOrigin === cleanMobileUrl || isVercel;
      if (!isAllowed) {
        throw new AppError('Cross-Site Request Forgery (CSRF) detected. Origin rejected.', 403, 'CSRF_REJECTED');
      }
    }

    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('No refresh token provided', 401);

    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ip = req.ip || 'Unknown IP';

    const result = await AuthService.rotateRefreshToken(token, deviceInfo, ip);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    res.clearCookie('refreshToken', { path: '/' });
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req?.cookies?.refreshToken;
    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie('refreshToken', { path: '/' });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const googleSSO = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || 'Unknown IP';
    const result = await AuthService.googleSSO(req.body, ip);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'SSO Login successful',
      data: {
        accessToken: result.accessToken,
        user: toUserResponseDTO(result.user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      message: 'If the account exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deviceInfo = (req.headers['user-agent'] as string) || 'Unknown Device';
    const ip = (req.ip as string) || req.socket.remoteAddress || 'Unknown IP';
    const result = await AuthService.resetPassword(req.body, deviceInfo, ip);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    const responseData: AuthResponseDTO = {
      accessToken: result.accessToken,
      user: toUserResponseDTO(result.user),
    };

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You are now logged in.',
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, token } = req.body;
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ip = req.ip || 'Unknown IP';

    const result = await AuthService.verifyAccount(identifier, token, deviceInfo, ip);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    const responseData: AuthResponseDTO = {
      accessToken: result.accessToken,
      user: toUserResponseDTO(result.user),
    };

    res.status(200).json({
      success: true,
      message: 'Account verified successfully. You are now logged in.',
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.body;
    await AuthService.resendOTP(identifier);
    
    res.status(200).json({
      success: true,
      message: 'If the account exists and is not verified, a new OTP has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await AuthService.deleteAccount(userId);
    
    res.clearCookie('refreshToken', { path: '/' });
    
    res.status(200).json({
      success: true,
      message: 'Account successfully deleted. We are sorry to see you go!',
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = await import('../app');
    const { resolveStorageUrl } = await import('../lib/storage');
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        avatarKey: true,
        avatarUrl: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        role: { select: { name: true, description: true } },
      }
    });

    if (!user) throw new AppError('User not found', 404);

    const resolvedData = {
      ...user,
      avatarUrl: resolveStorageUrl(user.avatarKey) || user.avatarUrl || null,
    };

    res.status(200).json({ success: true, message: 'Profile fetched successfully', data: resolvedData });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { fullName, phoneNumber, avatarUrl, avatarKey } = req.body;
    const { prisma } = await import('../app');
    const { objectExists, deleteObject, resolveStorageUrl, validateStorageKey } = await import('../lib/storage');

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, avatarKey: true, avatarUrl: true },
    });
    if (!currentUser) throw new AppError('User not found', 404);

    // If avatarKey is provided, verify it exists and belongs to this user
    if (avatarKey !== undefined) {
      if (avatarKey !== null && typeof avatarKey === 'string' && avatarKey.trim() !== '') {
        const cleanKey = avatarKey.trim();
        validateStorageKey(cleanKey);

        // Ownership enforcement: key must belong to users/:userId/avatar/
        const expectedPrefix = `users/${req.user!.userId}/avatar/`;
        if (!cleanKey.startsWith(expectedPrefix)) {
          throw new AppError('Access denied: Avatar key does not belong to this user', 403, 'FORBIDDEN_KEY');
        }

        // Verify object actually exists in S3/MinIO
        const exists = await objectExists(cleanKey);
        if (!exists) {
          throw new AppError('Specified avatar object does not exist in storage', 400, 'OBJECT_NOT_FOUND');
        }

        // Lifecycle: if replacing an existing avatar key, clean up old object
        if (currentUser.avatarKey && currentUser.avatarKey !== cleanKey) {
          try {
            await deleteObject(currentUser.avatarKey);
          } catch (e) {
            console.warn(`[Storage Lifecycle] Failed to delete old avatar object ${currentUser.avatarKey}:`, e);
          }
        }
      } else if (avatarKey === null && currentUser.avatarKey) {
        // Avatar removed: delete old storage object
        try {
          await deleteObject(currentUser.avatarKey);
        } catch (e) {
          console.warn(`[Storage Lifecycle] Failed to delete old avatar object ${currentUser.avatarKey}:`, e);
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { 
        ...(fullName && { fullName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(avatarKey !== undefined && { avatarKey }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        avatarKey: true,
        avatarUrl: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        role: { select: { name: true, description: true } },
      }
    });

    const responseData = {
      ...updatedUser,
      avatarUrl: resolveStorageUrl(updatedUser.avatarKey) || updatedUser.avatarUrl || null,
    };

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: responseData });
  } catch (err) {
    next(err);
  }
};

export const cancelRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      throw new AppError('Cancellation token is required', 400, 'INVALID_TOKEN');
    }

    const result = await AuthService.cancelRegistration(token);

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AKMart - Registration Cancelled</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { background: #0b0f19; color: #e2e8f0; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #131926; border: 1px solid #1e293b; border-radius: 16px; padding: 36px 28px; max-width: 440px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          h2 { color: #f97316; margin-top: 0; font-size: 22px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 12px 0 24px 0; }
          a { display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Registration Cancelled</h2>
          <p>${result.message}</p>
          <a href="${env.FRONTEND_WEB_URL}">Return to Store</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};
