import { Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class SessionController {
  static async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const sessions = await SessionService.getActiveSessions(userId);
      
      res.status(200).json({
        success: true,
        message: 'Active sessions retrieved successfully',
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { sessionId } = req.params;
      
      await SessionService.revokeSession(sessionId as string, userId);
      
      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async revokeAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await SessionService.revokeAllSessions(userId);
      
      // Clear their current cookie as well
      res.clearCookie('refreshToken');
      
      res.status(200).json({
        success: true,
        message: 'Logged out of all devices successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
