import axios from 'axios';
import apiClient from './client';

export interface UploadOptions {
  purpose: 'avatar' | 'review-photo' | 'product-image';
  maxSizeMB?: number;
  onProgress?: (progressPercent: number) => void;
  signal?: AbortSignal;
}

export interface UploadResult {
  key: string;
  url: string;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_DEFAULT_SIZE_MB = 5;

/**
 * Validates file type and size on client side prior to initiating network requests.
 */
export function validateImageFile(file: File, maxSizeMB = MAX_DEFAULT_SIZE_MB): string | null {
  if (!file) return 'No file selected';

  const isAllowed = ALLOWED_IMAGE_TYPES.some((type) => type === file.type.toLowerCase());
  if (!isAllowed) {
    return 'Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.';
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size exceeds ${maxSizeMB}MB limit. (Current: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
  }

  return null;
}

/**
 * Primary industry-standard upload function:
 * 1. Requests presigned upload URL from backend
 * 2. Uploads file directly to S3 / MinIO via HTTP PUT
 * 3. Falls back to streaming multipart upload if direct PUT fails
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const maxSizeMB = options.maxSizeMB || MAX_DEFAULT_SIZE_MB;
  const validationError = validateImageFile(file, maxSizeMB);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    // 1. Get presigned upload URL
    const presignResponse = await apiClient.post('/uploads/presign', {
      filename: file.name,
      contentType: file.type,
      size: file.size,
      purpose: options.purpose,
    });

    const { uploadUrl, key, publicUrl } = presignResponse.data.data;

    // 2. Direct PUT to S3/MinIO
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      signal: options.signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && options.onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(percentCompleted);
        }
      },
    });

    return { key, url: publicUrl };
  } catch (directUploadError: any) {
    // If canceled by user, rethrow
    if (axios.isCancel(directUploadError) || options.signal?.aborted) {
      throw new Error('Upload cancelled');
    }

    // Fallback: Streaming multipart upload through backend
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', options.purpose);

      const fallbackResponse = await apiClient.post('/uploads/direct', formData, {
        headers: {
          'Content-Type': undefined,
        },
        signal: options.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && options.onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options.onProgress(percentCompleted);
          }
        },
      });

      return fallbackResponse.data.data;
    } catch (fallbackError: any) {
      if (axios.isCancel(fallbackError) || options.signal?.aborted) {
        throw new Error('Upload cancelled');
      }
      const message =
        fallbackError.response?.data?.message ||
        fallbackError.response?.data?.error?.message ||
        fallbackError.message ||
        'Upload failed. Please try again.';
      throw new Error(message);
    }
  }
}
