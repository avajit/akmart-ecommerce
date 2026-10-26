import { z } from 'zod';
import { env } from '../config/env';
import { ALLOWED_MIME_TYPES } from '../lib/storage/magicBytes';

const MAX_BYTES = (env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024;

export const ALLOWED_PURPOSES = ['avatar', 'review-photo', 'product-image'] as const;
export type AllowedPurpose = (typeof ALLOWED_PURPOSES)[number];

export const presignUploadSchema = z.object({
  body: z.object({
    filename: z.string().min(1, 'Filename is required').max(255, 'Filename is too long'),
    contentType: z
      .string()
      .min(1, 'Content-Type is required')
      .refine(
        (val) => (ALLOWED_MIME_TYPES as readonly string[]).includes(val.toLowerCase()),
        {
          message: `Content-Type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
        }
      ),
    size: z
      .number()
      .positive('Size must be greater than 0')
      .max(MAX_BYTES, `File size exceeds the limit of ${env.MAX_IMAGE_SIZE_MB}MB`),
    purpose: z.enum(ALLOWED_PURPOSES, {
      message: `Purpose must be one of: ${ALLOWED_PURPOSES.join(', ')}`,
    }),
  }),
});
