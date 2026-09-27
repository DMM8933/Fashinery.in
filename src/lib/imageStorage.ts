export interface UploadedImageResult {
  id: string;
  url: string;
  storagePath: string;
  name: string;
}

/**
 * Uploads a product image via the server-side endpoint.
 * This completely avoids browser CORS issues and Firebase "storage/retry-limit-exceeded" errors.
 * Storage structure:
 * General: products/{productId}/general/{uniqueFileName}
 * Color: products/{productId}/colors/{colorId}/{uniqueFileName}
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  folder: 'general' | 'colors' = 'general',
  colorId?: string,
  onProgress?: (progress: number) => void
): Promise<UploadedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file from device.'));
    };

    reader.onload = () => {
      const base64Data = reader.result as string;
      const xhr = new XMLHttpRequest();

      xhr.open('POST', '/api/upload-image', true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.url) {
              if (onProgress) onProgress(100);
              resolve({
                id: response.id || `img_${Date.now()}`,
                url: response.url,
                storagePath: response.storagePath,
                name: response.name || file.name,
              });
            } else {
              reject(new Error(response.error || 'Server upload failed.'));
            }
          } catch (err: any) {
            reject(new Error('Invalid response from upload server.'));
          }
        } else {
          let errText = xhr.statusText;
          try {
            const errJson = JSON.parse(xhr.responseText);
            if (errJson.error) errText = errJson.error;
          } catch {}
          reject(new Error(`Upload failed (${xhr.status}): ${errText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error while uploading image. Please check connection.'));
      };

      xhr.send(
        JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
          base64Data,
          productId,
          folder,
          colorId,
        })
      );
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a community gallery image directly from device.
 * Stored under: community-gallery/{uniqueFileName}
 */
export async function uploadGalleryImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadedImageResult> {
  return new Promise((resolve, reject) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      return reject(new Error('Please upload a valid image (JPG, PNG, or WEBP).'));
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error('Image exceeds maximum allowed size of 5 MB.'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file from device.'));
    };

    reader.onload = () => {
      const base64Data = reader.result as string;
      const xhr = new XMLHttpRequest();

      xhr.open('POST', '/api/upload-image', true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.url) {
              if (onProgress) onProgress(100);
              resolve({
                id: response.id || `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                url: response.url,
                storagePath: response.storagePath || `community-gallery/${file.name}`,
                name: response.name || file.name,
              });
            } else {
              reject(new Error(response.error || 'Gallery image upload failed.'));
            }
          } catch (err: any) {
            reject(new Error('Invalid response from upload server.'));
          }
        } else {
          let errText = xhr.statusText;
          try {
            const errJson = JSON.parse(xhr.responseText);
            if (errJson.error) errText = errJson.error;
          } catch {}
          reject(new Error(`Upload failed (${xhr.status}): ${errText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error while uploading image. Please check connection.'));
      };

      xhr.send(
        JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
          base64Data,
          folder: 'community-gallery',
          type: 'community-gallery',
        })
      );
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Deletes an image via the server endpoint
 */
export async function deleteProductImageFile(storagePath: string): Promise<boolean> {
  if (!storagePath) return false;
  try {
    const res = await fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storagePath }),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Could not delete image:', err);
    return false;
  }
}
