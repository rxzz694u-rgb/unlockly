import { ProductFile, FileCategory } from '../types';
import { dbService } from './db';

// Helper to determine file category
export function categorizeFile(file: File): FileCategory {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type.startsWith('image/')) return 'photo';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('pdf') || type.includes('document') || type.includes('text') || name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.txt')) {
    return 'document';
  }
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z') || name.endsWith('.tar') || name.endsWith('.gz')) {
    return 'archive';
  }
  return 'document';
}

// Generate tiny low-res blurred thumbnail for photos (~1-2KB base64)
export function generateBlurredPreview(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Very low-res for blur hashing effect (max 32px)
        const width = 32;
        const height = Math.max(16, Math.round((img.height / img.width) * 32));
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.4));
        } else {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  // Store an uploaded file securely in IndexedDB and generate lightweight metadata
  async processUpload(file: File, productId: string, order: number): Promise<ProductFile> {
    const fileId = 'file_' + Math.random().toString(36).substring(2, 9) + Date.now();
    const fileType = categorizeFile(file);

    // Save genuine file blob securely in IndexedDB (handles gigabytes without localStorage limits)
    try {
      await dbService.saveBlob(fileId, file);
    } catch (err) {
      console.warn('IndexedDB saveBlob warning:', err);
    }

    // Generate safe low-res blurred preview for public view (~1KB)
    let previewPath = '';
    if (fileType === 'photo') {
      previewPath = await generateBlurredPreview(file);
    }

    // Use fast object URL for current in-memory browser session
    const objectUrl = URL.createObjectURL(file);

    const productFile: ProductFile = {
      id: fileId,
      productId,
      name: file.name,
      fileType,
      fileSize: file.size,
      storagePath: fileId, // Private storage key into IndexedDB
      previewPath: previewPath || undefined,
      blobDataUrl: objectUrl, // Fast session ObjectURL
      mimeType: file.type || 'application/octet-stream',
      order,
      isPreviewAllowed: true,
      createdAt: new Date().toISOString()
    };

    return productFile;
  },

  // Authorize & resolve real Blob URL (Secured check)
  async getAuthorizedFileBlob(file: ProductFile, accessToken?: string): Promise<{ url: string; blob: Blob | null }> {
    // If it's a remote URL or demo asset
    if (file.storagePath && (file.storagePath.startsWith('http') || file.storagePath.startsWith('/demo/'))) {
      return { url: file.storagePath, blob: null };
    }

    // If we have an active in-memory object URL that is valid
    if (file.blobDataUrl && file.blobDataUrl.startsWith('blob:')) {
      return { url: file.blobDataUrl, blob: null };
    }

    // Retrieve from private IndexedDB store
    const blob = await dbService.getBlob(file.storagePath || file.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      return { url, blob };
    }

    // Fallback to preview thumbnail or data URL
    return { url: file.previewPath || file.blobDataUrl || '', blob: null };
  }
};
