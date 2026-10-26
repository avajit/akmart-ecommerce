import React, { useRef } from 'react';
import { FiUploadCloud, FiX, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useImageUpload } from '../../hooks/useImageUpload';
import { UploadResult } from '../../api/storage.service';

export interface ImageUploaderProps {
  purpose: 'avatar' | 'review-photo' | 'product-image';
  label?: string;
  initialUrl?: string | null;
  maxSizeMB?: number;
  disabled?: boolean;
  onUploaded?: (result: UploadResult) => void;
  onCleared?: () => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  purpose,
  label = 'Upload Image',
  initialUrl = null,
  maxSizeMB = 5,
  disabled = false,
  onUploaded,
  onCleared,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    status,
    progress,
    error,
    previewUrl,
    result,
    selectFile,
    startUpload,
    cancelUpload,
    retry,
    reset,
  } = useImageUpload({
    purpose,
    maxSizeMB,
    onSuccess: (res) => onUploaded?.(res),
  });

  const displayImage = result?.url || previewUrl || initialUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const valid = selectFile(selectedFile);
      if (valid) {
        startUpload(selectedFile);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || status === 'uploading') return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const valid = selectFile(droppedFile);
      if (valid) {
        startUpload(droppedFile);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || status === 'uploading') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
    onCleared?.();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Accessible Label */}
      {label && (
        <label
          htmlFor={`file-upload-${purpose}`}
          className="block text-xs font-semibold uppercase tracking-wider text-gray-300"
        >
          {label}
        </label>
      )}

      {/* Screen reader live region */}
      <div className="sr-only" role="status" aria-live="polite">
        {status === 'uploading' && `Uploading image: ${progress}% completed.`}
        {status === 'success' && 'Image uploaded successfully.'}
        {status === 'error' && `Upload error: ${error}`}
      </div>

      {/* Main Upload Dropzone / Preview Card */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${label} - ${status === 'uploading' ? 'Uploading' : 'Click or drag and drop to select image'}`}
        aria-disabled={disabled}
        onClick={() => !disabled && status !== 'uploading' && fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center min-h-[140px] p-4 rounded-2xl border-2 border-dashed transition-all duration-200 outline-none
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900/40'
              : status === 'error'
              ? 'border-red-500/60 bg-red-950/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500'
              : status === 'success'
              ? 'border-emerald-500/60 bg-emerald-950/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500'
              : 'border-gray-700 hover:border-orange-500/80 bg-[#161616] hover:bg-[#1a1a1a] cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500'
          }`}
      >
        <input
          ref={fileInputRef}
          id={`file-upload-${purpose}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={disabled || status === 'uploading'}
          onChange={handleFileChange}
        />

        {/* 1. Preview Mode (when image exists and not uploading) */}
        {displayImage && status !== 'uploading' && (
          <div className="relative flex items-center gap-4 w-full">
            <img
              src={displayImage}
              alt="Uploaded Preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-700 shadow-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {result ? 'Image attached to storage' : 'Active Image'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Click or drag new image to replace</p>
              {status === 'success' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1">
                  <FiCheck className="w-3.5 h-3.5" /> Storage verified
                </span>
              )}
            </div>

            {/* Remove button (minimum 44x44px accessible touch target) */}
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove image"
              className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 2. Uploading State with Progress Bar & Cancel */}
        {status === 'uploading' && (
          <div className="w-full space-y-3 py-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-2">
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                Uploading to secure storage...
              </span>
              <span>{progress}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-150 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelUpload();
                }}
                className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 3. Idle / Empty State */}
        {!displayImage && status !== 'uploading' && status !== 'error' && (
          <div className="flex flex-col items-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FiUploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-white">
              Drag & drop image here, or <span className="text-orange-400 underline">browse</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              PNG, JPG, WebP or GIF up to {maxSizeMB}MB
            </p>
          </div>
        )}

        {/* 4. Error State */}
        {status === 'error' && (
          <div className="flex flex-col items-center text-center p-2 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-red-400 max-w-xs">{error}</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  retry();
                }}
                className="text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg border border-red-500/40 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs text-gray-400 hover:text-white px-3 py-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
