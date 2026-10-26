import crypto from 'crypto';
import path from 'path';
import { StorageValidationError } from './errors';

export interface GenerateKeyOptions {
  folder: string;
  ownerId: string;
  filename?: string;
  extension?: string;
}

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

/**
 * Sanitizes and extracts a valid file extension.
 * Defaults to 'webp' if extension is unknown or invalid.
 */
export function sanitizeExtension(filenameOrExt?: string): string {
  if (!filenameOrExt) return 'webp';

  const rawExt = filenameOrExt.includes('.')
    ? path.extname(filenameOrExt).replace(/^\./, '')
    : filenameOrExt;

  const clean = rawExt.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (ALLOWED_EXTENSIONS.has(clean)) {
    return clean === 'jpg' ? 'jpeg' : clean;
  }
  return 'webp';
}

/**
 * Validates and sanitizes a path segment (folder or ownerId).
 * Prevents directory traversal attacks (e.g. '../', '/..', hidden files, slashes).
 */
export function sanitizePathSegment(segment: string, fieldName = 'path segment'): string {
  if (!segment || typeof segment !== 'string') {
    throw new StorageValidationError(`${fieldName} is required and must be a string`);
  }

  const trimmed = segment.trim();

  // Block path traversal and dangerous characters
  if (
    trimmed.includes('..') ||
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    trimmed.includes('\0') ||
    /[<>:"|?*]/.test(trimmed)
  ) {
    throw new StorageValidationError(
      `Invalid characters or path traversal attempt detected in ${fieldName}: "${segment}"`
    );
  }

  // Allow only alphanumeric, hyphens, and underscores
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!sanitized) {
    throw new StorageValidationError(`Invalid ${fieldName}: sanitized value is empty`);
  }

  return sanitized;
}

/**
 * Generates an industry-standard, unique, unguessable storage object key.
 * Format:
 *  - avatar: users/{ownerId}/avatar/{uuid}.{ext}
 *  - review-photo: reviews/{ownerId}/{uuid}.{ext}
 *  - generic: {folder}/{ownerId}/{uuid}.{ext}
 */
export function generateKey(options: GenerateKeyOptions): string {
  const { folder, ownerId, filename, extension } = options;

  const cleanFolder = sanitizePathSegment(folder, 'folder');
  const cleanOwnerId = sanitizePathSegment(ownerId, 'ownerId');
  const ext = sanitizeExtension(extension || filename);
  const uuid = crypto.randomUUID();

  // Industry-standard semantic folder mapping
  if (cleanFolder === 'avatar') {
    return `users/${cleanOwnerId}/avatar/${uuid}.${ext}`;
  }
  if (cleanFolder === 'review-photo' || cleanFolder === 'reviews') {
    return `reviews/${cleanOwnerId}/${uuid}.${ext}`;
  }
  if (cleanFolder === 'product-image' || cleanFolder === 'products') {
    return `products/${cleanOwnerId}/${uuid}.${ext}`;
  }

  return `${cleanFolder}/${cleanOwnerId}/${uuid}.${ext}`;
}

/**
 * Strictly asserts that a stored or requested key is secure, relative, and non-traversing.
 */
export function validateStorageKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new StorageValidationError('Storage key must be a non-empty string');
  }

  if (
    key.startsWith('/') ||
    key.startsWith('\\') ||
    key.includes('..') ||
    key.includes('\0') ||
    key.includes('//') ||
    key.includes('\\') ||
    /[<>:"|?*]/.test(key)
  ) {
    throw new StorageValidationError(`Potentially malicious storage key detected: "${key}"`);
  }

  const parts = key.split('/');
  if (parts.length < 2) {
    throw new StorageValidationError('Storage key must contain a folder prefix and filename');
  }

  for (const part of parts) {
    if (!part || part === '.' || part === '..') {
      throw new StorageValidationError('Invalid path segments in storage key');
    }
  }
}
