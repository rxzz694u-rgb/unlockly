import JSZip from 'jszip';
import { Product, ProductFile } from '../types';
import { storageService } from './storageService';

export const downloadService = {
  // Download a single file
  async downloadSingleFile(file: ProductFile, productTitle: string): Promise<void> {
    try {
      const { url, blob } = await storageService.getAuthorizedFileBlob(file);
      
      let downloadUrl = url;
      let shouldRevoke = false;

      // If we have a remote image/asset URL, fetch as blob to enforce download header
      if (!blob && (url.startsWith('http') || url.startsWith('/demo/'))) {
        try {
          const response = await fetch(url);
          const fetchedBlob = await response.blob();
          downloadUrl = URL.createObjectURL(fetchedBlob);
          shouldRevoke = true;
        } catch {
          // If CORS prevents fetch, fallback to direct url
          downloadUrl = url;
        }
      } else if (blob) {
        downloadUrl = URL.createObjectURL(blob);
        shouldRevoke = true;
      }

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name || `${productTitle.toLowerCase().replace(/\s+/g, '_')}_file`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (shouldRevoke) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  },

  // Bundle all files of a product into a real ZIP file
  async downloadAllAsZip(product: Product, onProgress?: (percent: number) => void): Promise<void> {
    try {
      const zip = new JSZip();
      const folderName = `Unlockly_${product.title.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const folder = zip.folder(folderName) || zip;

      // Add a clean README license/access text file
      const readmeText = `=====================================================
UNLOCKLY PRIVATE DIGITAL CONTENT ARCHIVE
=====================================================
Title: ${product.title}
Creator: ${product.creatorName} (@${product.creatorHandle})
Price: ${product.currency} ${product.price.toFixed(2)}
Authorized Download Date: ${new Date().toUTCString()}

Thank you for supporting creators on Unlockly.
=====================================================
`;
      folder.file('README_ACCESS_LICENSE.txt', readmeText);

      // Add all media files
      for (let i = 0; i < product.files.length; i++) {
        const file = product.files[i];
        const { url, blob } = await storageService.getAuthorizedFileBlob(file);

        if (blob) {
          folder.file(file.name, blob);
        } else if (url) {
          try {
            const response = await fetch(url);
            const dataBlob = await response.blob();
            folder.file(file.name, dataBlob);
          } catch {
            // If CORS fails, create placeholder file with note
            folder.file(`${file.name}.txt`, `Direct access link: ${url}`);
          }
        }

        if (onProgress) {
          onProgress(Math.round(((i + 1) / product.files.length) * 50));
        }
      }

      // Generate the ZIP blob
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        if (onProgress) {
          onProgress(50 + Math.round(metadata.percent * 0.5));
        }
      });

      const zipUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(zipUrl), 10000);
    } catch (err) {
      console.error('Failed to bundle ZIP:', err);
    }
  }
};
