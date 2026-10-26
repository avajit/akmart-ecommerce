import { Request, Response, NextFunction } from 'express';
import busboy from 'busboy';
import { PassThrough } from 'stream';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { env } from '../config/env';
import {
  generateKey,
  getPresignedUploadUrl,
  getPublicUrl,
  streamObject,
  uploadObject,
  validateMagicBytes,
  validateStorageKey,
  isAllowedMimeType,
  StorageValidationError,
  StorageNotFoundError,
  findLocalStorageFile,
} from '../lib/storage';

const MAX_BYTES = (env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024;

/**
 * Primary: POST /api/v1/uploads/presign
 * Generates an unguessable S3 key and presigned upload URL for direct client PUT.
 */
export const presignUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename, contentType, size, purpose } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Authentication required' } });
      return;
    }

    // Generate strict unguessable server-side key
    const key = generateKey({
      folder: purpose,
      ownerId: userId,
      filename,
    });

    const presigned = await getPresignedUploadUrl(key, contentType, size);

    res.status(200).json({
      success: true,
      message: 'Presigned upload URL generated successfully',
      data: {
        uploadUrl: presigned.uploadUrl,
        key: presigned.key,
        expiresIn: presigned.expiresIn,
        publicUrl: getPublicUrl(key),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fallback: POST /api/v1/uploads/direct
 * Streams a multipart file upload directly to S3 without buffering the whole file to server disk.
 */
export const directUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Authentication required' } });
      return;
    }

    const contentTypeHeader = req.headers['content-type'] || '';
    if (!contentTypeHeader.includes('multipart/form-data')) {
      res.status(400).json({
        success: false,
        error: { message: 'Content-Type must be multipart/form-data' },
      });
      return;
    }

    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: MAX_BYTES,
        files: 1,
      },
    });

    let purpose = 'avatar';
    let uploadedKey: string | null = null;
    let fileHandled = false;
    let fileMimeType = '';
    let fileError: Error | null = null;
    const chunks: Buffer[] = [];

    bb.on('field', (name, val) => {
      if (name === 'purpose' && typeof val === 'string') {
        purpose = val;
      }
    });

    bb.on('file', (name, fileStream, info) => {
      if (fileHandled) {
        fileStream.resume(); // Discard any secondary files
        return;
      }
      fileHandled = true;

      const { filename, mimeType } = info;
      fileMimeType = mimeType;
      if (!isAllowedMimeType(mimeType)) {
        fileStream.resume();
        fileError = new StorageValidationError(`Unsupported file type: ${mimeType}`);
        return;
      }

      // Generate key
      const key = generateKey({
        folder: purpose,
        ownerId: userId,
        filename,
      });
      uploadedKey = key;

      let firstChunkReceived = false;
      let totalBytes = 0;

      fileStream.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > MAX_BYTES) {
          fileError = new StorageValidationError(`File exceeds max size of ${env.MAX_IMAGE_SIZE_MB}MB`);
          fileStream.destroy();
          return;
        }

        if (!firstChunkReceived) {
          firstChunkReceived = true;
          if (!validateMagicBytes(chunk, mimeType)) {
            fileError = new StorageValidationError('File header magic bytes do not match declared image type');
            fileStream.destroy();
            return;
          }
        }
        chunks.push(chunk);
      });

      fileStream.on('error', (err) => {
        fileError = err;
      });
    });

    bb.on('error', (err: any) => {
      next(err);
    });

    bb.on('finish', async () => {
      try {
        if (fileError) {
          throw fileError;
        }

        if (!fileHandled || chunks.length === 0 || !uploadedKey) {
          res.status(400).json({ success: false, error: { message: 'No valid file provided in request' } });
          return;
        }

        const fileBuffer = Buffer.concat(chunks);
        await uploadObject(uploadedKey, fileBuffer, fileMimeType, fileBuffer.length);

        res.status(201).json({
          success: true,
          message: 'File streamed to storage successfully',
          data: {
            key: uploadedKey,
            url: getPublicUrl(uploadedKey),
          },
        });
      } catch (err) {
        next(err);
      }
    });

    req.pipe(bb);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/files/:key(*)
 * Streams the file from storage with caching, ETag, and Content-Type headers.
 */
export const streamFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let rawKey: any = (req.params as any)?.key ?? (req.params as any)?.[0] ?? (req.params as any)?.['*'];
    if (Array.isArray(rawKey)) {
      rawKey = rawKey.join('/');
    }

    if (!rawKey || typeof rawKey !== 'string') {
      // Fallback extraction from req.path
      const match = req.path.match(/(?:\/api)?(?:\/v1)?\/(?:files|uploads)\/(.+)/);
      if (match) {
        rawKey = match[1];
      }
    }

    if (!rawKey) {
      throw new StorageNotFoundError('Empty storage key');
    }

    // Normalize: strip leading slashes and decode URI components if encoded
    const cleanKey = decodeURIComponent(String(rawKey)).replace(/^\/+/, '');
    validateStorageKey(cleanKey);

    const { stream, contentType, contentLength, etag, lastModified } = await streamObject(cleanKey);

    // ETag HTTP 304 validation
    if (etag) {
      res.setHeader('ETag', etag);
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }
    }

    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    if (contentLength !== undefined) {
      res.setHeader('Content-Length', contentLength.toString());
    }
    if (lastModified) {
      res.setHeader('Last-Modified', lastModified.toUTCString());
    }

    // Cache-Control: 1 year immutable for immutable UUID keys
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    stream.pipe(res);
  } catch (err: any) {
    if (err.name === 'StorageNotFoundError' || err.statusCode === 404) {
      res.status(404).json({ success: false, error: { message: 'File not found' } });
      return;
    }
    console.error(`[streamFile Error] ${req.method} ${req.url}:`, err);
    next(err);
  }
};
