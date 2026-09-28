import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  RefreshCw, 
  Loader2, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { uploadImage, deleteProductImageFile } from '../lib/imageStorage';
import { auth } from '../lib/firebase';

interface AdminImageUploadFieldProps {
  label: string;
  currentImageUrl?: string;
  currentStoragePath?: string;
  onUpload: (url: string, storagePath: string) => void;
  onRemove: () => void;
  folder: string; // e.g., 'categories', 'banners/desktop', 'products/primary'
  helperText?: string;
  aspectRatio?: string; // e.g., 'aspect-video', 'aspect-square', 'aspect-3/4'
}

export const AdminImageUploadField: React.FC<AdminImageUploadFieldProps> = ({
  label,
  currentImageUrl,
  currentStoragePath,
  onUpload,
  onRemove,
  folder,
  helperText,
  aspectRatio = 'aspect-video',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Please upload a valid image (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image exceeds 5MB size limit.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const idToken = await auth.currentUser?.getIdToken();
      
      const result = await uploadImage(file, folder, (pct) => {
        setProgress(pct);
      }, idToken);

      // If there was an old image, try to delete it (optional/best effort)
      if (currentStoragePath) {
        await deleteProductImageFile(currentStoragePath, idToken);
      }

      onUpload(result.url, result.storagePath);
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove this image?')) return;
    
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (currentStoragePath) {
        await deleteProductImageFile(currentStoragePath, idToken);
      }
    } catch (err) {
      console.warn('Delete cleanup error:', err);
    }
    onRemove();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase text-stone-700">
          {label}
        </label>
        {currentImageUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div className={`relative ${aspectRatio} w-full rounded-2xl border-2 border-dashed border-stone-300 overflow-hidden bg-stone-50 transition-all group`}>
        {currentImageUrl ? (
          <>
            <img
              src={currentImageUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-stone-900 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change Image</span>
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 hover:bg-stone-100/50 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:text-stone-600 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                {uploading ? 'Uploading...' : 'Upload Image'}
              </p>
              <p className="text-[10px] text-stone-500 mt-1">
                {helperText || 'Select from phone or device'}
              </p>
            </div>
          </button>
        )}

        {/* Progress Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <div className="w-full max-w-[200px] space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                <span>Uploading</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-stone-700 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Success / Error Messages as overlays */}
        {error && (
          <div className="absolute top-2 right-2 left-2 bg-rose-600 text-white text-[10px] p-2 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="p-0.5 hover:bg-rose-500 rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      {helperText && !currentImageUrl && (
        <p className="text-[10px] text-stone-400 px-1 italic">
          * {helperText}
        </p>
      )}
    </div>
  );
};
