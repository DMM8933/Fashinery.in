import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { ProductImageItem } from '../types';
import { uploadProductImage } from './imageStorage';

/**
 * Generates a safe, sanitized unique filename for Firebase Storage
 */
export function generateSafeFileName(originalName: string): string {
  const parts = originalName.split('.');
  const rawExt = parts.length > 1 ? parts.pop() : 'jpg';
  const cleanExt = (rawExt || 'jpg').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}_${randomStr}.${cleanExt}`;
}

/**
 * Uploads a product image directly to Firebase Storage.
 * General path: products/{productId}/general/{uniqueFileName}
 * Color path:   products/{productId}/colors/{colorId}/{uniqueFileName}
 */
export async function uploadProductImageFile(
  file: File,
  productId: string,
  subfolder: 'general' | 'colors' = 'general',
  colorId?: string,
  onProgress?: (progressPercent: number) => void
): Promise<ProductImageItem> {
  const cleanProductId = (productId || `prod-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = generateSafeFileName(file.name);

  let storagePath: string;
  if (subfolder === 'colors' && colorId) {
    const cleanColorId = colorId.replace(/[^a-zA-Z0-9_-]/g, '_');
    storagePath = `products/${cleanProductId}/colors/${cleanColorId}/${fileName}`;
  } else {
    storagePath = `products/${cleanProductId}/general/${fileName}`;
  }

  const storageRef = ref(storage, storagePath);

  // Upload with progress tracking
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        productId: cleanProductId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.warn('Firebase Storage upload notice, using reliable proxy upload:', error?.message);
        uploadProductImage(file, cleanProductId, subfolder, colorId, onProgress)
          .then((res) => {
            resolve({
              id: res.id,
              url: res.url,
              storagePath: res.storagePath,
              name: res.name,
              sortOrder: 0,
            });
          })
          .catch((fallbackErr) => {
            reject(fallbackErr);
          });
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const imageItem: ProductImageItem = {
            id: `img-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            url: downloadUrl,
            storagePath,
            name: file.name,
            sortOrder: 0,
          };
          resolve(imageItem);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Safely deletes a file from Firebase Storage
 */
export async function deleteProductImageFile(storagePathOrUrl: string): Promise<void> {
  if (!storagePathOrUrl) return;

  try {
    let fileRef;
    if (storagePathOrUrl.startsWith('gs://') || storagePathOrUrl.startsWith('http://') || storagePathOrUrl.startsWith('https://')) {
      fileRef = ref(storage, storagePathOrUrl);
    } else {
      fileRef = ref(storage, storagePathOrUrl);
    }
    await deleteObject(fileRef);
  } catch (err: any) {
    // If file does not exist or already deleted, don't crash
    if (err?.code !== 'storage/object-not-found') {
      console.warn('Note on deleting file from storage:', err);
    }
  }
}
