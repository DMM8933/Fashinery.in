import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Instagram,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  CommunityGalleryItem,
  DEFAULT_COMMUNITY_GALLERY,
  OFFICIAL_FASHINERY_INSTAGRAM,
} from '../types';
import { uploadGalleryImage, deleteProductImageFile } from '../lib/imageStorage';
import { auth } from '../lib/firebase';

export const AdminCommunityGalleryTab: React.FC = () => {
  const { settings, saveCommunityGallery, isAdmin } = useStore();

  // Initialize slots: load from settings.communityGallery or default 4 images
  const [items, setItems] = useState<CommunityGalleryItem[]>(() => {
    if (
      settings.communityGallery &&
      Array.isArray(settings.communityGallery) &&
      settings.communityGallery.length > 0
    ) {
      return settings.communityGallery.map((item, idx) => ({
        ...item,
        sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : idx,
        active: item.active !== false,
      }));
    }
    return DEFAULT_COMMUNITY_GALLERY;
  });

  // Track upload progress per item ID
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Status & notifications
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Hidden file inputs for each slot
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Sync state if settings update from Firestore real-time listener and user isn't dirty
  useEffect(() => {
    if (
      settings.communityGallery &&
      Array.isArray(settings.communityGallery) &&
      settings.communityGallery.length > 0 &&
      !uploadingId &&
      !isSaving
    ) {
      setItems(settings.communityGallery);
    }
  }, [settings.communityGallery]);

  // Clean auto-dismiss toast
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Handle direct file upload from phone gallery / desktop
  const handleFileUpload = async (file: File, itemId: string) => {
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'Image exceeds maximum recommended size of 5 MB. Please select a smaller photo.',
      });
      return;
    }

    setUploadingId(itemId);
    setUploadProgress((prev) => ({ ...prev, [itemId]: 10 }));

    try {
      const idToken = await auth.currentUser?.getIdToken();
      const result = await uploadGalleryImage(file, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [itemId]: progress }));
      }, idToken);

      // Update item in state with new image URL and storagePath
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            // If old image had a storagePath, clean it up asynchronously
            if (item.storagePath && item.storagePath !== result.storagePath) {
              deleteProductImageFile(item.storagePath, idToken).catch(() => {});
            }
            return {
              ...item,
              imageUrl: result.url,
              storagePath: result.storagePath,
              title: item.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            };
          }
          return item;
        })
      );

      setStatusMessage({
        type: 'success',
        text: `Image uploaded successfully. Click "Save Gallery" to publish changes to the live homepage.`,
      });
    } catch (err: any) {
      console.error('Gallery image upload error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to upload image. Please try again.',
      });
    } finally {
      setUploadingId(null);
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  // Add new image slot (unlimited)
  const handleAddSlot = () => {
    const newId = `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSlot: CommunityGalleryItem = {
      id: newId,
      imageUrl:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      storagePath: '',
      sortOrder: items.length,
      active: true,
      instagramUrl: OFFICIAL_FASHINERY_INSTAGRAM,
      title: `Celebration Style #${items.length + 1}`,
      likes: '1.2k',
      handle: '@fashinery.in',
    };
    setItems((prev) => [...prev, newSlot]);
  };

  // Delete image slot
  const handleDeleteSlot = async (itemId: string) => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return;

    if (items.length <= 1) {
      setStatusMessage({
        type: 'error',
        text: 'The gallery must keep at least 1 image slot.',
      });
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to remove this gallery image? It will stop appearing on the homepage.`
      )
    ) {
      return;
    }

    // Delete from storage if storagePath exists
    if (targetItem.storagePath) {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        deleteProductImageFile(targetItem.storagePath, idToken).catch(() => {});
      } catch (err) {
        console.warn('Auth token retrieval for delete slot:', err);
      }
    }

    setItems((prev) => {
      const remaining = prev.filter((i) => i.id !== itemId);
      return remaining.map((item, idx) => ({ ...item, sortOrder: idx }));
    });

    setStatusMessage({
      type: 'success',
      text: 'Image removed from gallery. Click "Save Gallery" to update the live website.',
    });
  };

  // Move up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated.map((item, idx) => ({ ...item, sortOrder: idx }));
    });
  };

  // Move down
  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated.map((item, idx) => ({ ...item, sortOrder: idx }));
    });
  };

  // Toggle active/inactive
  const handleToggleActive = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, active: !item.active } : item))
    );
  };

  // Update Instagram URL
  const handleInstagramUrlChange = (itemId: string, val: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, instagramUrl: val } : item))
    );
  };

  // Reset to default 4
  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Reset all gallery slots to the original 4 Fashinery curated images? You will need to click "Save Gallery" to apply.'
      )
    ) {
      setItems(DEFAULT_COMMUNITY_GALLERY);
      setStatusMessage({
        type: 'success',
        text: 'Reset to default 4 images. Click "Save Gallery" to publish.',
      });
    }
  };

  // Save gallery to Firestore
  const handleSaveGallery = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      // Ensure all items have valid order and fallback instagram link
      const preparedItems = items.map((item, index) => {
        let cleanInstagram = item.instagramUrl?.trim() || '';
        if (!cleanInstagram || !cleanInstagram.includes('instagram.com')) {
          cleanInstagram = OFFICIAL_FASHINERY_INSTAGRAM;
        }
        return {
          ...item,
          sortOrder: index,
          instagramUrl: cleanInstagram,
        };
      });

      const success = await saveCommunityGallery(preparedItems);
      if (success) {
        setStatusMessage({
          type: 'success',
          text: 'Community gallery updated successfully.',
        });
      } else {
        throw new Error('Failed to update gallery in Firestore.');
      }
    } catch (err: any) {
      console.error('Error saving community gallery:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save community gallery. Please check permissions.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Breadcrumb */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 font-medium">
          <span>Admin Panel</span>
          <span>&rarr;</span>
          <span className="text-stone-700">Website Content / Homepage</span>
          <span>&rarr;</span>
          <span className="text-amber-800 font-semibold">Community &amp; Styling Gallery</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-amber-700" />
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Community &amp; Styling Gallery
              </h2>
              <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold border border-amber-300">
                #FashineryWomen
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl">
              Manage the photos displayed in the homepage &ldquo;COMMUNITY &amp; STYLING / #FashineryWomen&rdquo;
              section. Upload images directly from your mobile gallery or desktop. All clicks open the official
              FASHINERY Instagram profile (<span className="text-amber-900 font-mono">@fashinery.in</span>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset 4 Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleAddSlot}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Image Slot</span>
            </button>

            <button
              type="button"
              disabled={isSaving || !!uploadingId}
              onClick={handleSaveGallery}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-stone-950 hover:bg-stone-900 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Save Gallery</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Gallery Image Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item, index) => {
          const isSlotUploading = uploadingId === item.id;
          const currentProgress = uploadProgress[item.id] || 0;

          return (
            <div
              key={item.id ? `${item.id}-${index}` : `slot-${index}`}
              className={`bg-white rounded-2xl border transition-all flex flex-col overflow-hidden shadow-xs hover:shadow-md ${
                item.active ? 'border-stone-200' : 'border-stone-300 opacity-75 bg-stone-50/70'
              }`}
            >
              {/* Slot Header */}
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-amber-300 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-xs text-stone-800 tracking-wide uppercase">
                    IMAGE {index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Reorder Up */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    title="Move earlier in gallery"
                    className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-md transition disabled:opacity-25 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMoveDown(index)}
                    title="Move later in gallery"
                    className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-md transition disabled:opacity-25 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Active / Inactive Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id)}
                    title={item.active ? 'Visible on homepage (click to hide)' : 'Hidden (click to show)'}
                    className={`p-1 rounded-md transition cursor-pointer ${
                      item.active
                        ? 'text-emerald-700 hover:bg-emerald-100'
                        : 'text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {item.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete Slot */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(item.id)}
                    title="Delete image slot"
                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Current Image Preview */}
              <div className="relative aspect-square bg-stone-100 group overflow-hidden border-b border-stone-100">
                {item.imageUrl && item.imageUrl.trim() !== '' ? (
                  <img
                    src={item.imageUrl.trim()}
                    alt={item.title || `Slot ${index + 1}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                    <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                    <span className="text-xs">No image uploaded</span>
                  </div>
                )}

                {/* Uploading Spinner Overlay */}
                {isSlotUploading && (
                  <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-2xs flex flex-col items-center justify-center text-white p-4">
                    <Loader2 className="w-7 h-7 animate-spin text-amber-400 mb-2" />
                    <span className="text-xs font-semibold">Uploading photo...</span>
                    <span className="text-[11px] text-amber-200 font-mono mt-1">{currentProgress}%</span>
                    <div className="w-32 bg-stone-700 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full transition-all duration-200"
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                      item.active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-700 text-stone-200'
                    }`}
                  >
                    {item.active ? 'Published' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Controls & Form Section */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {/* Direct Upload Button (Mobile Gallery / Desktop) */}
                <div>
                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[item.id] = el;
                    }}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, item.id);
                      }
                      e.target.value = '';
                    }}
                  />

                  <button
                    type="button"
                    disabled={isSlotUploading}
                    onClick={() => fileInputRefs.current[item.id]?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                    <span>{item.imageUrl ? 'Upload New Image' : 'Select Photo'}</span>
                  </button>

                  <p className="text-[10px] text-stone-400 text-center mt-1">
                    JPG, PNG, WEBP (Max 5 MB)
                  </p>
                </div>

                {/* Optional Instagram Link */}
                <div className="space-y-1 pt-1 border-t border-stone-100">
                  <label className="text-[10px] font-semibold text-stone-700 flex items-center justify-between">
                    <span>Instagram Link</span>
                    <span className="text-[9px] text-stone-400">Optional Post</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={item.instagramUrl || ''}
                      onChange={(e) => handleInstagramUrlChange(item.id, e.target.value)}
                      placeholder="https://www.instagram.com/fashinery.in/"
                      className="w-full text-xs px-2.5 py-1.5 pr-6 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
                    />
                    <a
                      href={item.instagramUrl || OFFICIAL_FASHINERY_INSTAGRAM}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-2 text-stone-400 hover:text-amber-700"
                      title="Open link"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[9px] text-stone-400 leading-tight">
                    Leave blank to automatically open @fashinery.in profile.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slot and Save Bottom Controls */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Currently showing <strong>{items.filter((i) => i.active).length}</strong> active photo(s) on the
            homepage. You can add as many photos as needed.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleAddSlot}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-900 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Another Image</span>
          </button>

          <button
            type="button"
            disabled={isSaving || !!uploadingId}
            onClick={handleSaveGallery}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                <span>Saving to Live Website...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-stone-950" />
                <span>Save Gallery</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
