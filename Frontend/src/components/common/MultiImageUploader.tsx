import React, { useRef, useState } from 'react';
import { 
  FiUploadCloud, 
  FiTrash2, 
  FiStar, 
  FiArrowLeft, 
  FiArrowRight, 
  FiLink, 
  FiPlus, 
  FiImage 
} from 'react-icons/fi';
import { uploadImage } from '../../api/storage.service';
import { toast } from 'react-toastify';

export interface ProductImageItem {
  url: string;
  isPrimary: boolean;
  altText?: string;
}

export interface MultiImageUploaderProps {
  label?: string;
  images: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  purpose?: 'product-image' | 'review-photo';
  disabled?: boolean;
  className?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  label = 'Product Photos (Up to 5)',
  images = [],
  onChange,
  maxImages = 5,
  maxSizeMB = 5,
  purpose = 'product-image',
  disabled = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Filter out empty placeholder entries if any
  const validImages = images.filter((img) => img && img.url && img.url.trim() !== '');

  const ensurePrimary = (list: ProductImageItem[]): ProductImageItem[] => {
    if (list.length === 0) return [];
    const hasPrimary = list.some((img) => img.isPrimary);
    if (!hasPrimary) {
      return list.map((img, idx) => ({ ...img, isPrimary: idx === 0 }));
    }
    return list;
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (disabled || isUploading) return;
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const availableSlots = maxImages - validImages.length;
    if (availableSlots <= 0) {
      toast.warn(`You have already added the maximum limit of ${maxImages} images.`);
      return;
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      toast.info(`Only the first ${availableSlots} image(s) will be uploaded to stay within the ${maxImages} image limit.`);
    }

    setIsUploading(true);
    setUploadProgress(10);

    const uploadedItems: ProductImageItem[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type.toLowerCase())) {
        toast.error(`"${file.name}" is not a supported format. Please use JPG, PNG, or WebP.`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the ${maxSizeMB}MB file size limit.`);
        continue;
      }

      try {
        const result = await uploadImage(file, {
          purpose,
          maxSizeMB,
          onProgress: (p) => {
            const stepPercent = Math.round(((i + p / 100) / filesToUpload.length) * 100);
            setUploadProgress(stepPercent);
          },
        });

        uploadedItems.push({
          url: result.url,
          isPrimary: validImages.length === 0 && uploadedItems.length === 0,
          altText: file.name.replace(/\.[^/.]+$/, ''),
        });
      } catch (err: any) {
        toast.error(`Failed to upload "${file.name}": ${err.message || 'Storage error'}`);
      }
    }

    if (uploadedItems.length > 0) {
      const updated = ensurePrimary([...validImages, ...uploadedItems]);
      onChange(updated);
      toast.success(`Successfully uploaded ${uploadedItems.length} product photo(s)!`);
    }

    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = validImages.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const remaining = validImages.filter((_, idx) => idx !== index);
    onChange(ensurePrimary(remaining));
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= validImages.length) return;
    const copy = [...validImages];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onChange(ensurePrimary(copy));
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    if (validImages.length >= maxImages) {
      toast.warn(`Maximum ${maxImages} images reached.`);
      return;
    }

    try {
      new URL(customUrl.trim());
    } catch {
      toast.error('Please enter a valid HTTP or HTTPS image URL.');
      return;
    }

    const newItem: ProductImageItem = {
      url: customUrl.trim(),
      isPrimary: validImages.length === 0,
      altText: 'Product photo',
    };

    const updated = ensurePrimary([...validImages, newItem]);
    onChange(updated);
    setCustomUrl('');
    setShowUrlInput(false);
    toast.success('Image URL attached!');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <FiImage className="text-orange-400" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700/80">
            {validImages.length} / {maxImages} Photos
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
          >
            <FiLink /> {showUrlInput ? 'Hide URL input' : 'Or paste URL'}
          </button>
        </div>
      </div>

      {/* Optional URL Input Form */}
      {showUrlInput && (
        <form onSubmit={handleAddCustomUrl} className="flex gap-2 p-3 bg-black/60 rounded-xl border border-gray-800">
          <input
            type="url"
            placeholder="https://images.unsplash.com/... or CDN link"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition active:scale-95"
          >
            Add
          </button>
        </form>
      )}

      {/* Dropzone Upload Area */}
      {validImages.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
              : 'border-gray-800 bg-[#121212]/80 hover:border-gray-700 hover:bg-[#161616]'
          } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xl shadow-lg shadow-orange-500/10">
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiUploadCloud />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {isUploading ? 'Uploading to Backblaze B2...' : 'Click or Drag & Drop Photos Here'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Supports up to {maxImages} images (JPG, PNG, WebP up to {maxSizeMB}MB each)
              </p>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="w-full max-w-xs mt-3">
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-orange-500 h-1.5 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-orange-400 font-mono mt-1 block">
                  {uploadProgress}% completed
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Uploaded Images Gallery Preview Grid */}
      {validImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {validImages.map((img, index) => (
            <div
              key={`${img.url}-${index}`}
              className={`group relative aspect-square rounded-2xl overflow-hidden bg-[#161616] border transition-all duration-200 ${
                img.isPrimary
                  ? 'border-orange-500 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/10'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <img
                src={img.url}
                alt={img.altText || `Photo ${index + 1}`}
                className="w-full h-full object-cover object-center"
                onError={(e: any) => {
                  e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600';
                }}
              />

              {/* Primary Badge */}
              {img.isPrimary && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                  <FiStar className="fill-white text-[9px]" /> Primary
                </div>
              )}

              {/* Overlay Actions on Hover */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                {/* Top Actions: Reorder */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'left')}
                    aria-label="Move photo left"
                    className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center text-xs transition"
                  >
                    <FiArrowLeft />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    aria-label="Delete photo"
                    className="w-6 h-6 rounded bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center text-xs transition"
                  >
                    <FiTrash2 />
                  </button>

                  <button
                    type="button"
                    disabled={index === validImages.length - 1}
                    onClick={() => handleMove(index, 'right')}
                    aria-label="Move photo right"
                    className="w-6 h-6 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center text-xs transition"
                  >
                    <FiArrowRight />
                  </button>
                </div>

                {/* Bottom Action: Make Primary */}
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="w-full py-1 bg-black/80 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1 border border-gray-700 hover:border-orange-500"
                  >
                    <FiStar /> Set Main
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add more button if slots remaining */}
          {validImages.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="aspect-square rounded-2xl border border-dashed border-gray-800 hover:border-orange-500/60 bg-[#121212] hover:bg-[#161616] flex flex-col items-center justify-center text-gray-500 hover:text-orange-400 transition group"
            >
              <FiPlus className="text-xl group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold uppercase tracking-wider mt-1">Add Photo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
