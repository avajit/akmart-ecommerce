import { describe, it, expect } from 'vitest';
import {
  generateKey,
  sanitizeExtension,
  sanitizePathSegment,
  validateStorageKey,
} from '../../lib/storage/keyGenerator';
import {
  detectMimeType,
  validateMagicBytes,
  isAllowedMimeType,
  ALLOWED_MIME_TYPES,
} from '../../lib/storage/magicBytes';
import {
  StorageValidationError,
  StorageNotFoundError,
  StorageUploadError,
} from '../../lib/storage/errors';

describe('Storage Unit Tests', () => {
  describe('Extension & Key Sanitization', () => {
    it('should sanitize standard image extensions correctly', () => {
      expect(sanitizeExtension('profile.jpg')).toBe('jpeg');
      expect(sanitizeExtension('photo.PNG')).toBe('png');
      expect(sanitizeExtension('graphic.webp')).toBe('webp');
      expect(sanitizeExtension('animated.gif')).toBe('gif');
      expect(sanitizeExtension('jpeg')).toBe('jpeg');
    });

    it('should fallback to webp for unrecognized or empty extensions', () => {
      expect(sanitizeExtension('script.exe')).toBe('webp');
      expect(sanitizeExtension('document.pdf')).toBe('webp');
      expect(sanitizeExtension('')).toBe('webp');
      expect(sanitizeExtension(undefined)).toBe('webp');
    });

    it('should sanitize valid path segments', () => {
      expect(sanitizePathSegment('user-123_abc')).toBe('user-123_abc');
      expect(sanitizePathSegment('avatar')).toBe('avatar');
    });

    it('should throw StorageValidationError on path traversal attempts', () => {
      expect(() => sanitizePathSegment('../etc/passwd')).toThrow(StorageValidationError);
      expect(() => sanitizePathSegment('folder/../sub')).toThrow(StorageValidationError);
      expect(() => sanitizePathSegment('..\\windows\\system32')).toThrow(StorageValidationError);
      expect(() => sanitizePathSegment('folder\0null')).toThrow(StorageValidationError);
      expect(() => sanitizePathSegment('folder/subfolder')).toThrow(StorageValidationError);
    });

    it('should generate properly structured, unguessable keys with UUIDs', () => {
      const avatarKey = generateKey({
        folder: 'avatar',
        ownerId: 'user-456',
        filename: 'my_photo.png',
      });
      expect(avatarKey).toMatch(/^users\/user-456\/avatar\/[0-9a-fA-F-]{36}\.png$/);

      const reviewKey = generateKey({
        folder: 'review-photo',
        ownerId: 'user-789',
        filename: 'damaged_item.jpg',
      });
      expect(reviewKey).toMatch(/^reviews\/user-789\/[0-9a-fA-F-]{36}\.jpeg$/);

      const productKey = generateKey({
        folder: 'product-image',
        ownerId: 'seller-999',
        filename: 'product.webp',
      });
      expect(productKey).toMatch(/^products\/seller-999\/[0-9a-fA-F-]{36}\.webp$/);
    });

    it('should validate valid storage keys and reject dangerous keys', () => {
      expect(() => validateStorageKey('users/123/avatar/abc-def-123.webp')).not.toThrow();
      expect(() => validateStorageKey('reviews/user-1/photo-456.jpeg')).not.toThrow();

      // Reject leading slashes, path traversal, backslashes
      expect(() => validateStorageKey('/users/123/avatar/photo.webp')).toThrow(StorageValidationError);
      expect(() => validateStorageKey('users/../etc/passwd')).toThrow(StorageValidationError);
      expect(() => validateStorageKey('users\\123\\photo.webp')).toThrow(StorageValidationError);
      expect(() => validateStorageKey('invalid-single-segment')).toThrow(StorageValidationError);
    });
  });

  describe('Magic Bytes Detection & Validation', () => {
    it('should recognize allowed MIME types', () => {
      for (const mime of ALLOWED_MIME_TYPES) {
        expect(isAllowedMimeType(mime)).toBe(true);
      }
      expect(isAllowedMimeType('application/pdf')).toBe(false);
      expect(isAllowedMimeType('text/html')).toBe(false);
      expect(isAllowedMimeType('application/x-executable')).toBe(false);
    });

    it('should detect PNG from magic bytes', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      expect(detectMimeType(pngHeader)).toBe('image/png');
      expect(validateMagicBytes(pngHeader, 'image/png')).toBe(true);
      expect(validateMagicBytes(pngHeader, 'image/jpeg')).toBe(false);
    });

    it('should detect JPEG from magic bytes', () => {
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      expect(detectMimeType(jpegHeader)).toBe('image/jpeg');
      expect(validateMagicBytes(jpegHeader, 'image/jpeg')).toBe(true);
      expect(validateMagicBytes(jpegHeader, 'image/jpg')).toBe(true);
      expect(validateMagicBytes(jpegHeader, 'image/png')).toBe(false);
    });

    it('should detect WebP from magic bytes (RIFF ... WEBP)', () => {
      const webpHeader = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x20, 0x00, 0x00, 0x00, // Size
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]);
      expect(detectMimeType(webpHeader)).toBe('image/webp');
      expect(validateMagicBytes(webpHeader, 'image/webp')).toBe(true);
      expect(validateMagicBytes(webpHeader, 'image/png')).toBe(false);
    });

    it('should detect GIF from magic bytes', () => {
      const gifHeader = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00]);
      expect(detectMimeType(gifHeader)).toBe('image/gif');
      expect(validateMagicBytes(gifHeader, 'image/gif')).toBe(true);
    });

    it('should reject corrupted or incomplete headers', () => {
      const randomBytes = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c]);
      expect(detectMimeType(randomBytes)).toBeNull();
      expect(validateMagicBytes(randomBytes, 'image/png')).toBe(false);

      const tooShort = Buffer.from([0xff, 0xd8]);
      expect(detectMimeType(tooShort)).toBeNull();
    });
  });

  describe('Typed Storage Errors', () => {
    it('should instantiate typed errors with appropriate status codes', () => {
      const notFound = new StorageNotFoundError('test/key.webp');
      expect(notFound.statusCode).toBe(404);
      expect(notFound.code).toBe('STORAGE_NOT_FOUND');
      expect(notFound.message).toContain('test/key.webp');

      const validation = new StorageValidationError('Invalid size');
      expect(validation.statusCode).toBe(400);
      expect(validation.code).toBe('STORAGE_VALIDATION_ERROR');

      const upload = new StorageUploadError('Network failure', new Error('timeout'));
      expect(upload.statusCode).toBe(500);
      expect(upload.code).toBe('STORAGE_UPLOAD_ERROR');
    });
  });
});
