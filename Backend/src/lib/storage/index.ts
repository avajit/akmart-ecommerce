import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';

export function getLocalStorageDir(): string {
  const candidates = [
    path.resolve(process.cwd(), 'storage_local'),
    path.resolve(process.cwd(), 'Backend/storage_local'),
    path.resolve(__dirname, '../../storage_local'),
    path.resolve(__dirname, '../../../storage_local'),
    path.resolve(__dirname, '../../../../storage_local'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return path.resolve(process.cwd(), 'storage_local');
}

export function findLocalStorageFile(key: string): string | null {
  const normalizedKey = key.replace(/\\/g, '/');
  const segments = normalizedKey.split('/').filter(Boolean);
  const candidates = [
    path.resolve(process.cwd(), 'storage_local'),
    path.resolve(process.cwd(), 'Backend/storage_local'),
    path.resolve(__dirname, '../../storage_local'),
    path.resolve(__dirname, '../../../storage_local'),
    path.resolve(__dirname, '../../../../storage_local'),
  ];
  for (const dir of candidates) {
    const fullPath = path.join(dir, ...segments);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}
import {
  StorageError,
  StorageNotFoundError,
  StorageValidationError,
  StorageUploadError,
} from './errors';
import { validateStorageKey } from './keyGenerator';
import { isAllowedMimeType } from './magicBytes';

export * from './errors';
export * from './keyGenerator';
export * from './magicBytes';

/**
 * Singleton shared S3 client instance.
 * Reused across the entire application lifecycle.
 */
export const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  // Node 24 & AWS SDK v3: prevents chunked checksum errors when content-length is not computed upfront
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

let bucketInitialized = false;

/**
 * Ensures S3/MinIO bucket exists and CORS rules allow client direct PUT uploads.
 */
export async function ensureBucketAndCors(): Promise<void> {
  if (bucketInitialized) return;

  try {
    const { CreateBucketCommand, PutBucketCorsCommand, HeadBucketCommand } = await import('@aws-sdk/client-s3');
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
    } catch (headErr: any) {
      if (headErr.name === 'NotFound' || headErr.$metadata?.httpStatusCode === 404) {
        await s3Client.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
      }
    }

    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: env.S3_BUCKET,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedHeaders: ['*'],
              ExposeHeaders: ['ETag', 'Content-Type', 'Content-Length'],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );

    bucketInitialized = true;
  } catch {
    // If strict IAM or offline, proceed without failing
    bucketInitialized = true;
  }
}

/**
 * Uploads an object directly to S3/MinIO (server-side upload).
 * Explicitly resolves buffer and ContentLength to prevent Node 24 x-amz-decoded-content-length errors.
 */
export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array | Readable,
  contentType: string,
  contentLength?: number
): Promise<{ key: string; etag?: string }> {
  validateStorageKey(key);

  if (!isAllowedMimeType(contentType)) {
    throw new StorageValidationError(`Unsupported Content-Type: ${contentType}`);
  }

  await ensureBucketAndCors();

  let resolvedBody: Buffer | Uint8Array;
  let resolvedLength: number;

  if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
    resolvedBody = body;
    resolvedLength = contentLength !== undefined ? contentLength : body.length;
  } else if (body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    resolvedBody = Buffer.concat(chunks);
    resolvedLength = contentLength !== undefined ? contentLength : resolvedBody.length;
  } else {
    resolvedBody = Buffer.alloc(0);
    resolvedLength = 0;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: resolvedBody,
      ContentType: contentType,
      ContentLength: resolvedLength,
    });

    const response = await s3Client.send(command);
    return { key, etag: response.ETag };
  } catch (err: any) {
    // If S3/MinIO is unreachable (e.g. MinIO not started locally in dev), fallback to local storage
    if (env.NODE_ENV !== 'production' && (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || !err.$metadata)) {
      try {
        const normalizedKey = key.replace(/\\/g, '/');
        const localFilePath = path.join(getLocalStorageDir(), ...normalizedKey.split('/'));
        await fs.promises.mkdir(path.dirname(localFilePath), { recursive: true });
        await fs.promises.writeFile(localFilePath, resolvedBody);
        return { key, etag: 'local-dev-etag' };
      } catch (localWriteErr: any) {
        throw new StorageUploadError(`Failed to save object locally: ${localWriteErr.message}`, localWriteErr);
      }
    }
    throw new StorageUploadError(`Failed to upload object "${key}": ${err.message}`, err);
  }
}

/**
 * Generates a presigned PUT URL allowing clients to upload directly to S3/MinIO.
 * The client sends PUT directly to this URL with the matching Content-Type header.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  _maxSize?: number
): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
  validateStorageKey(key);

  if (!isAllowedMimeType(contentType)) {
    throw new StorageValidationError(`Disallowed MIME type: ${contentType}`);
  }

  await ensureBucketAndCors();

  const expiresIn = env.S3_PRESIGN_EXPIRES_SECONDS || 300;

  try {
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return { uploadUrl, key, expiresIn };
  } catch (err: any) {
    throw new StorageUploadError(`Failed to generate presigned upload URL: ${err.message}`, err);
  }
}

/**
 * Generates a temporary presigned GET URL for secure, private read access.
 */
export async function getPresignedReadUrl(
  key: string,
  expiresIn = env.S3_PRESIGN_EXPIRES_SECONDS || 300
): Promise<string> {
  validateStorageKey(key);

  try {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (err: any) {
    throw new StorageError(`Failed to generate presigned read URL: ${err.message}`, 500);
  }
}

/**
 * Constructs the canonical public access URL for an asset.
 * If S3_PUBLIC_BASE_URL is configured (e.g. CloudFront/CDN), returns the CDN URL.
 * Otherwise, routes through the application gateway endpoint (/api/v1/files/:key).
 */
export function getPublicUrl(key: string): string {
  validateStorageKey(key);

  if (env.S3_PUBLIC_BASE_URL && env.S3_PUBLIC_BASE_URL.trim() !== '') {
    return `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
  }

  const baseUrl = (env.BACKEND_URL || `http://localhost:${env.PORT || 5000}`).replace(/\/$/, '');
  return `${baseUrl}/api/v1/files/${key}`;
}

/**
 * Universal URL resolver for stored entity keys.
 * Preserves external URLs (e.g. Google OAuth avatars) and resolves storage keys to usable URLs.
 */
export function resolveStorageUrl(keyOrUrl: string | null | undefined): string | null {
  if (!keyOrUrl || typeof keyOrUrl !== 'string' || keyOrUrl.trim() === '') {
    return null;
  }

  // Already a full external HTTP(S) URL
  if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
    return keyOrUrl;
  }

  try {
    return getPublicUrl(keyOrUrl);
  } catch {
    return keyOrUrl;
  }
}

/**
 * Streams an object directly from storage as a Node.js Readable stream.
 * Ideal for streaming gateway endpoints supporting Range headers and auth checks.
 */
export async function streamObject(key: string): Promise<{
  stream: Readable;
  contentType?: string;
  contentLength?: number;
  etag?: string;
  lastModified?: Date;
}> {
  validateStorageKey(key);

  // 1. Check local storage first (dev fallback)
  const localFilePath = findLocalStorageFile(key);
  if (localFilePath) {
    try {
      const stat = await fs.promises.stat(localFilePath);
      const ext = path.extname(key).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
      };
      const mime = mimeMap[ext] || 'application/octet-stream';
      return {
        stream: fs.createReadStream(localFilePath),
        contentType: mime,
        contentLength: stat.size,
        etag: `"${stat.mtimeMs}"`,
        lastModified: stat.mtime,
      };
    } catch {}
  }

  // 2. Stream from S3/MinIO
  try {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new StorageNotFoundError(key);
    }

    return {
      stream: response.Body as Readable,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      etag: response.ETag,
      lastModified: response.LastModified,
    };
  } catch (err: any) {
    if (
      err.name === 'NoSuchKey' || 
      err.$metadata?.httpStatusCode === 404 ||
      (env.NODE_ENV !== 'production' && (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || !err.$metadata))
    ) {
      throw new StorageNotFoundError(key);
    }
    throw new StorageError(`Error streaming object "${key}": ${err.message}`, 500);
  }
}

/**
 * Deletes an object from S3/MinIO and local fallback storage.
 */
export async function deleteObject(key: string): Promise<void> {
  validateStorageKey(key);

  const localFilePath = findLocalStorageFile(key);
  if (localFilePath) {
    try {
      await fs.promises.unlink(localFilePath);
    } catch {}
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (err: any) {
    if (env.NODE_ENV !== 'production' && (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED'))) {
      return;
    }
    throw new StorageError(`Failed to delete object "${key}": ${err.message}`, 500);
  }
}

/**
 * Checks whether an object exists in storage via lightweight HEAD or local check.
 */
export async function objectExists(key: string): Promise<boolean> {
  try {
    validateStorageKey(key);
  } catch {
    return false;
  }

  const localFilePath = findLocalStorageFile(key);
  if (localFilePath) {
    return true;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (err: any) {
    if (
      err.name === 'NotFound' ||
      err.name === 'NoSuchKey' ||
      err.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }
    return false;
  }
}
