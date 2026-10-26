import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { uploadLimiter } from '../middlewares/rateLimiter';
import { presignUploadSchema } from '../validators/upload.validator';
import * as uploadController from '../controllers/upload.controller';

const router = Router();

// Primary: Direct presigned client upload URL generation
router.post(
  '/presign',
  requireAuth,
  uploadLimiter,
  validateRequest(presignUploadSchema),
  uploadController.presignUpload
);

// Fallback: Streaming multipart upload directly to storage (no disk buffering)
router.post(
  '/direct',
  requireAuth,
  uploadLimiter,
  uploadController.directUpload
);

// Public / Authenticated Streaming access to stored objects with Range & ETag
router.get('/files/{*key}', uploadController.streamFile);

export default router;
