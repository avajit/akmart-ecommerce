import { prisma } from '../app';
import { AppError } from '../utils/AppError';

export class SessionService {
  /**
   * Retrieves all active sessions for a given user.
   */
  static async getActiveSessions(userId: string) {
    return await prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
      select: {
        id: true,
        deviceInfo: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revokes a specific session owned by the user.
   */
  static async revokeSession(sessionId: string, userId: string) {
    const session = await prisma.refreshToken.findFirst({
      where: { id: sessionId, userId, revokedAt: null },
    });

    if (!session) {
      throw new AppError('Active session not found', 404, 'SESSION_NOT_FOUND');
    }

    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revokes all active sessions for a given user (log out everywhere).
   */
  static async revokeAllSessions(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
