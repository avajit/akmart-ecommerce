import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// All session routes require authentication
router.use(requireAuth);

router.get('/', SessionController.getSessions as any);
router.delete('/', SessionController.revokeAllSessions as any); // Log out of all devices
router.delete('/:sessionId', SessionController.revokeSession as any);

export default router;
