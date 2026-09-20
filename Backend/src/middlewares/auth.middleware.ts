import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../app';

// Extend Express Request to include the decoded user payload
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { roleName?: string };
}

/**
 * Middleware to protect routes. 
 * Extracts Bearer token, verifies it, and attaches user to req.user.
 */
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized. Please log in.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Unauthorized. Token missing.', 401, 'UNAUTHORIZED');
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists and is active (prevents deleted/banned users from using valid tokens)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user) {
      throw new AppError('User no longer exists.', 401, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated.', 403, 'ACCOUNT_DISABLED');
    }

    // Attach to request
    req.user = {
      ...decoded,
      roleName: user.role.name // Attach role name for easy RBAC checks
    };

    next();
  } catch (error: any) {
    // If it's a JWT error (expired or invalid), throw a clean 401
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Session expired. Please refresh your token.', 401, 'TOKEN_EXPIRED'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token.', 401, 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to restrict routes to specific roles (RBAC).
 * Must be used AFTER `requireAuth`.
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roleName) {
      return next(new AppError('Unauthorized. Role missing.', 403, 'FORBIDDEN'));
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return next(new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN'));
    }

    next();
  };
};
