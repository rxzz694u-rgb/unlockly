import { Product, Purchase, AccessPermission, User, ActivityItem } from '../types';

const DB_NAME = 'unlockly_secure_db';
const DB_VERSION = 2;
const BLOB_STORE = 'secure_blobs';
const PRODUCT_STORE = 'secure_products';

// IndexedDB Helper for private local Blob storage & structured entities
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PRODUCT_STORE)) {
        db.createObjectStore(PRODUCT_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Sanitize products before storing in localStorage to ensure it never exceeds the 5MB browser quota
function sanitizeProductsForLocalStorage(products: Product[]): Product[] {
  return products.map((product) => {
    const safeFiles = product.files.map((file) => {
      // Remove any giant base64 strings from localStorage copy
      const isHuge = file.blobDataUrl && file.blobDataUrl.length > 50000;
      return {
        ...file,
        blobDataUrl: isHuge ? undefined : file.blobDataUrl
      };
    });

    const isCoverHuge = product.coverImage && product.coverImage.length > 50000;
    return {
      ...product,
      coverImage: isCoverHuge ? product.previewBlurUrl || '' : product.coverImage,
      files: safeFiles
    };
  });
}

export const dbService = {
  // --- IndexedDB Secure Blob Storage ---
  async saveBlob(id: string, blob: Blob): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BLOB_STORE, 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      store.put({ id, blob, createdAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getBlob(id: string): Promise<Blob | null> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(BLOB_STORE, 'readonly');
        const store = tx.objectStore(BLOB_STORE);
        const req = store.get(id);
        req.onsuccess = () => {
          resolve(req.result ? req.result.blob : null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },

  // Save product to IndexedDB
  async saveProductToIndexedDB(product: Product): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(PRODUCT_STORE, 'readwrite');
      const store = tx.objectStore(PRODUCT_STORE);
      store.put(product);
    } catch (err) {
      console.warn('IndexedDB product save error:', err);
    }
  },

  // --- LocalStorage Structured Data Helpers with Safe Fallback ---
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem('unlockly_products');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading products from localStorage:', e);
      return [];
    }
  },

  saveProducts(products: Product[]) {
    // 1. Asynchronously save all products to IndexedDB
    products.forEach((p) => {
      this.saveProductToIndexedDB(p);
    });

    // 2. Safely save lightweight sanitized version to localStorage
    try {
      const safe = sanitizeProductsForLocalStorage(products);
      localStorage.setItem('unlockly_products', JSON.stringify(safe));
    } catch (e) {
      console.warn('localStorage quota exceeded, trimmed for safety:', e);
      try {
        // Extreme trim fallback
        const extremeTrim = products.map((p) => ({
          ...p,
          coverImage: p.previewBlurUrl || '',
          files: p.files.map((f) => ({ ...f, blobDataUrl: undefined }))
        }));
        localStorage.setItem('unlockly_products', JSON.stringify(extremeTrim));
      } catch (innerErr) {
        console.warn('Could not write to localStorage:', innerErr);
      }
    }
  },

  getPurchases(): Purchase[] {
    try {
      const data = localStorage.getItem('unlockly_purchases');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  savePurchases(purchases: Purchase[]) {
    try {
      localStorage.setItem('unlockly_purchases', JSON.stringify(purchases));
    } catch (e) {
      console.warn('Error saving purchases:', e);
    }
  },

  getAccessPermissions(): AccessPermission[] {
    try {
      const data = localStorage.getItem('unlockly_permissions');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAccessPermissions(permissions: AccessPermission[]) {
    try {
      localStorage.setItem('unlockly_permissions', JSON.stringify(permissions));
    } catch (e) {
      console.warn('Error saving permissions:', e);
    }
  },

  getUser(): User | null {
    try {
      const data = localStorage.getItem('unlockly_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveUser(user: User) {
    try {
      localStorage.setItem('unlockly_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Error saving user:', e);
    }
  },

  getActivities(): ActivityItem[] {
    try {
      const data = localStorage.getItem('unlockly_activities');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveActivities(activities: ActivityItem[]) {
    try {
      localStorage.setItem('unlockly_activities', JSON.stringify(activities));
    } catch (e) {
      console.warn('Error saving activities:', e);
    }
  }
};
