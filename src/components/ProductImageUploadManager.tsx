import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { uploadProductImageFile, deleteProductImageFile } from '../lib/storage';
import { ProductImageItem } from '../types';

interface ProductImageUploadManagerProps {
  productId: string;
  images: string[];
  galleryImages?: ProductImageItem[];
  onChange: (images: string[], galleryImages: ProductImageItem[]) => void;
}

export const ProductImageUploadManager: React.FC<ProductImageUploadManagerProps> = ({
  productId,
  images = [],
  galleryImages = [],
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Normalize image items list: ensure every url in images has a corresponding ProductImageItem
  const normalizedItems: ProductImageItem[] = images.map((url, idx) => {
    const existing = galleryImages?.find((g) => g.url === url);
    return (
      existing || {
        id: `img-${idx}-${Date.now()}`,
        url,
        isPrimary: idx === 0,
        sortOrder: idx,
      }
    );
  });

  const updateImagesList = (newItems: ProductImageItem[]) => {
    const newUrls = newItems.map((item) => item.url);
    const updatedMetadata = newItems.map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
      sortOrder: idx,
    }));
    onChange(newUrls, updatedMetadata);
  };

  // Upload handler for multiple files
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const filesArray = Array.from(fileList);
    const uploadedNewItems: ProductImageItem[] = [];

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        if (!file.type.startsWith('image/')) {
          throw new Error(`"${file.name}" is not a recognized image file.`);
        }

        const uploaded = await uploadProductImageFile(
          file,
          productId || `prod-${Date.now()}`,
          'general',
          undefined,
          (pct) => {
            const overallPct = Math.round(((i + pct / 100) / filesArray.length) * 100);
            setUploadProgress(overallPct);
          }
        );
        uploadedNewItems.push(uploaded);
      }

      const combined = [...normalizedItems, ...uploadedNewItems];
      updateImagesList(combined);
      setUploadProgress(100);
    } catch (err: any) {
      console.error('Failed to upload product images:', err);
      setUploadError(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Replace a specific image
  const handleReplaceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      const oldItem = normalizedItems[replacingIndex];
      const uploaded = await uploadProductImageFile(
        file,
        productId || `prod-${Date.now()}`,
        'general'
      );

      const updated = [...normalizedItems];
      updated[replacingIndex] = uploaded;
      updateImagesList(updated);

      // Clean up old storage file if it had a path
      if (oldItem.storagePath) {
        deleteProductImageFile(oldItem.storagePath).catch(() => {});
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to replace image.');
    } finally {
      setIsUploading(false);
      setReplacingIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  // Set an image as primary (moves it to index 0)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const updated = [...normalizedItems];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    updateImagesList(updated);
  };

  // Reorder left / right
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === normalizedItems.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    const updated = [...normalizedItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    updateImagesList(updated);
  };

  // Delete an image
  const handleDeleteImage = (index: number) => {
    const itemToDelete = normalizedItems[index];
    const updated = normalizedItems.filter((_, idx) => idx !== index);
    updateImagesList(updated);

    if (itemToDelete?.storagePath) {
      deleteProductImageFile(itemToDelete.storagePath).catch(() => {});
    }
  };

  // Add by URL fallback
  const handleAddUrl = () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setUploadError('Please enter a valid image URL beginning with https://');
      return;
    }

    const newItem: ProductImageItem = {
      id: `img-url-${Date.now()}`,
      url: cleanUrl,
      sortOrder: normalizedItems.length,
      isPrimary: normalizedItems.length === 0,
    };
    updateImagesList([...normalizedItems, newItem]);
    setUrlInput('');
    setShowUrlFallback(false);
  };

  return (
    <div className="space-y-4 bg-stone-50/80 border border-stone-200 rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-900" />
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900">
              Product Images
            </h4>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold font-mono">
              {normalizedItems.length} {normalizedItems.length === 1 ? 'Image' : 'Images'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Uploaded images are saved to Firebase Storage and dynamically displayed on the live website. Image #1 serves as the primary hero, and Image #2 as the hover image.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden file input for multiple uploads */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          {/* Hidden file input for replacement */}
          <input
            type="file"
            ref={replaceInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleReplaceFileSelected}
          />

          <button
            id="btn-upload-product-images"
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : '+ Upload Images'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlFallback(!showUrlFallback)}
            className="px-2.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-[11px] text-stone-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Add via external URL"
          >
            <LinkIcon className="w-3 h-3 text-stone-500" />
            <span>Add by URL</span>
          </button>
        </div>
      </div>

      {/* Progress & Error Banners */}
      {isUploading && (
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-800 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
              <span>Uploading image files to Firebase Storage...</span>
            </span>
            <span className="font-mono font-bold text-amber-900">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-800 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Optional URL input fallback */}
      {showUrlFallback && (
        <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center gap-2 animate-fade-in">
          <LinkIcon className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste direct image URL (https://...)"
            className="flex-1 text-xs bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 focus:bg-white focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
          >
            Add Image
          </button>
          <button
            type="button"
            onClick={() => setShowUrlFallback(false)}
            className="p-1.5 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Zone (if empty or active) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFilesSelected(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-amber-800 bg-amber-50/50'
            : normalizedItems.length === 0
            ? 'border-stone-300 bg-white hover:border-amber-700 hover:bg-amber-50/20'
            : 'border-stone-200 bg-white/50 hover:border-stone-300'
        }`}
      >
        <div className="max-w-sm mx-auto space-y-2 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-stone-800">
            {normalizedItems.length === 0
              ? 'Click to browse or drop product images here'
              : 'Drop more images here to add to gallery'}
          </p>
          <p className="text-[11px] text-stone-400">
            Supports JPG, PNG, WebP, SVG. Select multiple images at once from desktop or camera roll.
          </p>
        </div>
      </div>

      {/* Image Gallery Cards Grid */}
      {normalizedItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
          {normalizedItems.map((item, index) => {
            const isPrimary = index === 0;
            const isHover = index === 1;

            return (
              <div
                key={item.id ? `${item.id}-${index}` : `${item.url || index}-${index}`}
                className={`relative group bg-white rounded-2xl overflow-hidden border transition-all ${
                  isPrimary
                    ? 'border-amber-800 ring-2 ring-amber-800/20 shadow-md'
                    : 'border-stone-200 shadow-xs hover:border-stone-400'
                }`}
              >
                {/* Image Aspect Box */}
                <div className="aspect-3/4 relative bg-stone-100 overflow-hidden">
                  {item.url && item.url.trim() !== '' ? (
                    <img
                      src={item.url.trim()}
                      alt={`Product view ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                      No image
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-stone-950 text-amber-300 px-2 py-0.5 rounded-md shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        <span>Primary Hero</span>
                      </span>
                    )}
                    {isHover && !isPrimary && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-800/90 text-stone-200 px-2 py-0.5 rounded-md shadow-xs">
                        Hover View
                      </span>
                    )}
                    <span className="text-[9px] font-mono font-bold bg-white/90 text-stone-700 px-1.5 py-0.5 rounded self-start">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Top Right Quick Delete */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(index);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-stone-500 hover:text-rose-600 hover:bg-white shadow-xs transition-colors cursor-pointer z-10"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Controls Toolbar */}
                <div className="p-2.5 bg-white space-y-2 border-t border-stone-100 text-[11px]">
                  {/* Primary & Reorder Buttons */}
                  <div className="flex items-center justify-between gap-1">
                    {!isPrimary ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="text-[10px] font-semibold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        title="Set as primary hero image"
                      >
                        <Star className="w-3 h-3" />
                        <span>Set Primary</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-700" />
                        <span>Main Photo</span>
                      </span>
                    )}

                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-stone-200 rounded-md overflow-hidden bg-stone-50">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveImage(index, 'left')}
                        className="p-1 hover:bg-stone-200 text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Left (Higher Priority)"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === normalizedItems.length - 1}
                        onClick={() => handleMoveImage(index, 'right')}
                        className="p-1 hover:bg-stone-200 text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Right (Lower Priority)"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Replace Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingIndex(index);
                      replaceInputRef.current?.click();
                    }}
                    className="w-full text-[10px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 py-1 px-2 rounded-md font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Replace Image</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
