import { useState, useRef, useCallback, useEffect } from 'react';
import { uploadImage, validateImageFile, UploadOptions, UploadResult } from '../api/storage.service';

export type UploadStatus = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

export interface UseImageUploadOptions {
  purpose: 'avatar' | 'review-photo' | 'product-image';
  maxSizeMB?: number;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export function useImageUpload(options: UseImageUploadOptions) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Sets and validates a file selection, creating a local preview.
   */
  const selectFile = useCallback(
    (newFile: File) => {
      const validationError = validateImageFile(newFile, options.maxSizeMB);
      if (validationError) {
        setError(validationError);
        setStatus('error');
        options.onError?.(new Error(validationError));
        return false;
      }

      // Cleanup old preview
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setFile(newFile);
      setPreviewUrl(URL.createObjectURL(newFile));
      setError(null);
      setProgress(0);
      setStatus('selected');
      return true;
    },
    [options, previewUrl]
  );

  /**
   * Initiates direct upload to S3/MinIO.
   */
  const startUpload = useCallback(
    async (fileToUpload?: File) => {
      const targetFile = fileToUpload || file;
      if (!targetFile) {
        setError('No file selected for upload');
        setStatus('error');
        return null;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setStatus('uploading');
      setProgress(0);
      setError(null);

      try {
        const uploadResult = await uploadImage(targetFile, {
          purpose: options.purpose,
          maxSizeMB: options.maxSizeMB,
          signal: controller.signal,
          onProgress: (p) => setProgress(p),
        });

        setResult(uploadResult);
        setStatus('success');
        setProgress(100);
        options.onSuccess?.(uploadResult);
        return uploadResult;
      } catch (err: any) {
        if (controller.signal.aborted) {
          setStatus('selected');
          setError('Upload cancelled');
          return null;
        }

        const errorMessage = err.message || 'Upload failed. Please try again.';
        setError(errorMessage);
        setStatus('error');
        options.onError?.(err);
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [file, options]
  );

  /**
   * Cancels any active network request.
   */
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('selected');
    setProgress(0);
  }, []);

  /**
   * Retries uploading the currently selected file.
   */
  const retry = useCallback(() => {
    if (file) {
      startUpload(file);
    }
  }, [file, startUpload]);

  /**
   * Resets all state back to initial idle condition.
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus('idle');
  }, [previewUrl]);

  return {
    status,
    progress,
    error,
    file,
    previewUrl,
    result,
    selectFile,
    startUpload,
    cancelUpload,
    retry,
    reset,
  };
}
