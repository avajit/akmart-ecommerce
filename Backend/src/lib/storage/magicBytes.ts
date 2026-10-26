export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime.toLowerCase());
}

/**
 * Detects MIME type by inspecting file header magic bytes directly from a buffer.
 * Provides server-side defense against extension spoofing.
 */
export function detectMimeType(buffer: Buffer): AllowedMimeType | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // JPEG / JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // WebP: RIFF [4 bytes size] WEBP
  // RIFF = 0x52 0x49 0x46 0x46
  // WEBP = 0x57 0x45 0x42 0x50
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'image/gif';
  }

  return null;
}

/**
 * Validates that buffer's magic bytes match the claimed Content-Type.
 */
export function validateMagicBytes(buffer: Buffer, declaredContentType: string): boolean {
  const detected = detectMimeType(buffer);
  if (!detected) return false;

  const normalizedDeclared = declaredContentType.toLowerCase().trim();
  if (normalizedDeclared === detected) return true;

  // Accept image/jpg as image/jpeg
  if (normalizedDeclared === 'image/jpg' && detected === 'image/jpeg') {
    return true;
  }

  return false;
}
