import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
} from 'lucide-react';
import { ProductImageItem } from '../types';
import { uploadProductImage, deleteProductImageFile } from '../lib/imageStorage';
import { auth } from '../lib/firebase';

interface AdminProductImagesManagerProps {
  productId?: string;
  images: string[];
  galleryImages?: ProductImageItem[];
  onChange: (images: string[], galleryImages: ProductImageItem[]) => void;
  folder?: 'general' | 'colors';
  colorId?: string;
  colorName?: string;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

export const AdminProductImagesManager: React.FC<AdminProductImagesManagerProps> = ({
  productId = 'temp_product',
  images = [],
  galleryImages = [],
  onChange,
  folder = 'general',
  colorId,
  colorName,
  maxImages,
  label = 'Product Images',
  helperText = 'Upload high-resolution editorial photos. The primary image will be displayed on the catalog and storefront hero.',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadName, setCurrentUploadName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Normalize current images into unified items list
  const currentItems: ProductImageItem[] = React.useMemo(() => {
    // If galleryImages exist and match the images count/content, use them
    if (galleryImages && galleryImages.length > 0) {
      return galleryImages;
    }
    // Otherwise build from images strings
    return (images || []).map((url, idx) => ({
      id: `img-${idx}-${url.slice(-10)}`,
      url,
      isPrimary: idx === 0,
      sortOrder: idx,
      name: `Image ${idx + 1}`,
    }));
  }, [images, galleryImages]);

  const notifyChange = (updatedItems: ProductImageItem[]) => {
    const newImages = updatedItems.map((item) => item.url);
    onChange(newImages, updatedItems);
  };

  // Upload one or multiple files
  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setUploading(true);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setErrorMessage(`"${file.name}" is not an image file.`);
        continue;
      }
      // Check file size (e.g., max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds 15MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    try {
      const newItems: ProductImageItem[] = [...currentItems];
      const idToken = await auth.currentUser?.getIdToken();

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setCurrentUploadName(file.name);
        setUploadProgress(0);

        const uploaded = await uploadProductImage(
          file,
          productId,
          folder,
          colorId,
          (pct) => setUploadProgress(pct),
          idToken
        );

        const isFirst = newItems.length === 0;
        newItems.push({
          id: uploaded.id,
          url: uploaded.url,
          storagePath: uploaded.storagePath,
          name: uploaded.name,
          isPrimary: isFirst,
          sortOrder: newItems.length,
        });
      }

      // Ensure first item is always marked primary if not set
      if (!newItems.some((it) => it.isPrimary) && newItems.length > 0) {
        newItems[0].isPrimary = true;
      }

      notifyChange(newItems);
      setSuccessMessage(
        `Successfully uploaded ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setErrorMessage(
        err?.message || 'Failed to upload image. Please verify connection and try again.'
      );
    } finally {
      setUploading(false);
      setCurrentUploadName('');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Replace single image
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;

    setErrorMessage(null);
    setUploading(true);
    setCurrentUploadName(`Replacing with ${file.name}`);

    try {
      const idToken = await auth.currentUser?.getIdToken();
      const uploaded = await uploadProductImage(
        file,
        productId,
        folder,
        colorId,
        (pct) => setUploadProgress(pct),
        idToken
      );

      const oldItem = currentItems[replacingIndex];
      // Clean up old storage if possible
      if (oldItem?.storagePath) {
        deleteProductImageFile(oldItem.storagePath, idToken).catch(() => {});
      }

      const updated = [...currentItems];
      updated[replacingIndex] = {
        ...updated[replacingIndex],
        id: uploaded.id,
        url: uploaded.url,
        storagePath: uploaded.storagePath,
        name: uploaded.name,
      };

      notifyChange(updated);
      setSuccessMessage(`Image replaced successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Replace failed:', err);
      setErrorMessage(err?.message || 'Failed to replace image.');
    } finally {
      setUploading(false);
      setReplacingIndex(null);
      if (replaceInputRef.current) {
        replaceInputRef.current.value = '';
      }
    }
  };

  // Set an image as primary
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const itemToPromote = currentItems[index];
    const remaining = currentItems.filter((_, i) => i !== index);
    const updated = [itemToPromote, ...remaining].map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
      sortOrder: idx,
    }));
    notifyChange(updated);
  };

  // Reorder: move left / up
  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentItems.length) return;

    const updated = [...currentItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
      sortOrder: idx,
    }));
    notifyChange(reordered);
  };

  // Delete image
  const handleDelete = async (index: number) => {
    const itemToDelete = currentItems[index];
    if (itemToDelete?.storagePath) {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        deleteProductImageFile(itemToDelete.storagePath, idToken).catch(() => {});
      } catch (err) {
        console.warn('Auth token retrieval for delete:', err);
      }
    }

    const updated = currentItems.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
      sortOrder: idx,
    }));
    notifyChange(updated);
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFilesUpload(e.target.files);
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-stone-700" />
            <h4 className="font-semibold text-xs uppercase tracking-wider text-stone-900">
              {label}
              {colorName && (
                <span className="ml-2 text-stone-500 font-normal lowercase">
                  for <strong className="text-stone-800 uppercase">{colorName}</strong>
                </span>
              )}
            </h4>
            <span className="text-[11px] font-mono bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-bold">
              {currentItems.length} {currentItems.length === 1 ? 'image' : 'images'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">{helperText}</p>
        </div>

        {/* Action Button: + Upload Images */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 active:scale-98 text-amber-300 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>+ Upload Images</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Uploading progress notification */}
      {uploading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
              <span>Uploading image: <strong>{currentUploadName}</strong></span>
            </span>
            <span className="font-mono text-amber-700 font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-600 h-1.5 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Drag & drop or click upload zone if empty */}
      {currentItems.length === 0 && !uploading && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleFilesUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-stone-900 bg-stone-100 scale-[1.01]'
              : 'border-stone-300 hover:border-stone-400 bg-white'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-500">
            <Upload className="w-6 h-6" />
          </div>
          <p className="font-serif text-sm font-bold text-stone-800">
            Click or drag &amp; drop product images here
          </p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            PNG, JPG, WEBP up to 15MB each. Direct upload to Firebase Storage with automatic thumbnail creation.
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-amber-300 rounded-lg text-xs font-semibold uppercase tracking-wider">
              <Plus className="w-3.5 h-3.5" />
              <span>Select from Device</span>
            </span>
          </div>
        </div>
      )}

      {/* Grid of uploaded images */}
      {currentItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {currentItems.map((item, index) => {
            const isPrimary = index === 0;

            return (
              <div
                key={item.id ? `${item.id}-${index}` : `${item.url || index}-${index}`}
                className={`group relative bg-white rounded-xl border overflow-hidden flex flex-col transition-all shadow-xs ${
                  isPrimary
                    ? 'border-amber-400 ring-2 ring-amber-400/40'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                {/* Image preview */}
                <div className="relative aspect-3/4 w-full bg-stone-100 overflow-hidden">
                  {item.url && item.url.trim() !== '' ? (
                    <img
                      src={item.url.trim()}
                      alt={item.name || `Product image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                      No image
                    </div>
                  )}

                  {/* Primary Badge */}
                  {isPrimary ? (
                    <div className="absolute top-2 left-2 bg-stone-900/90 text-amber-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-xs">
                      <Star className="w-3 h-3 fill-amber-300" />
                      <span>Primary Image</span>
                    </div>
                  ) : (
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Controls Card Footer */}
                <div className="p-2 bg-stone-50 border-t border-stone-100 space-y-1.5">
                  {/* Primary button if not primary */}
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="w-full bg-white hover:bg-amber-50 hover:text-amber-800 text-stone-700 border border-stone-200 hover:border-amber-300 py-1 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Star className="w-3 h-3" />
                      <span>Set Primary</span>
                    </button>
                  )}

                  {/* Action buttons bar */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {/* Reorder left / up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'left')}
                      className="p-1.5 rounded-md bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Move Earlier"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>

                    {/* Reorder right / down */}
                    <button
                      type="button"
                      disabled={index === currentItems.length - 1}
                      onClick={() => handleMove(index, 'right')}
                      className="p-1.5 rounded-md bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Move Later"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {/* Replace */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingIndex(index);
                        replaceInputRef.current?.click();
                      }}
                      className="p-1.5 rounded-md bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
                      title="Replace Image"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="p-1.5 rounded-md bg-white border border-stone-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 cursor-pointer ml-auto"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick upload card slot at the end */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-3/4 border-2 border-dashed border-stone-300 hover:border-stone-900 hover:bg-stone-100 rounded-xl flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-stone-900 transition-all cursor-pointer p-4 group"
          >
            <div className="w-9 h-9 rounded-full bg-stone-200 group-hover:bg-stone-900 group-hover:text-amber-300 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-center">
              Add More
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
