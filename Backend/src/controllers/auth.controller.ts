import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { toUserResponseDTO, AuthResponseDTO } from '../dtos/auth.dto';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { userId: user.id },
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

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: env.JWT_REFRESH_EXPIRES_IN_MS,
    });

    const responseData: AuthResponseDTO = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
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
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) throw new AppError('No refresh token provided', 401);

    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ip = req.ip || 'Unknown IP';

    const result = await AuthService.rotateRefreshToken(token, deviceInfo, ip);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: env.JWT_REFRESH_EXPIRES_IN_MS,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    res.clearCookie('refreshToken');
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie('refreshToken');
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

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: env.JWT_REFRESH_EXPIRES_IN_MS,
    });

    res.status(200).json({
      success: true,
      message: 'SSO Login successful',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
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
    await AuthService.resetPassword(req.body);
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, token } = req.body;
    await AuthService.verifyAccount(identifier, token);
    res.status(200).json({
      success: true,
      message: 'Account verified successfully. You can now log in.',
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
    
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Account successfully deleted. We are sorry to see you go!',
    });
  } catch (error) {
    next(error);
  }
};
