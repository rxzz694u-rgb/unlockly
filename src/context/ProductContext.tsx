import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductFile, Purchase, AccessPermission, CurrencyCode, AccessType, ActivityItem } from '../types';
import { dbService } from '../services/db';
import { INITIAL_PRODUCTS, INITIAL_PURCHASES, INITIAL_PERMISSIONS, INITIAL_ACTIVITIES } from '../services/demoData';
import { useAuth } from './AuthContext';
import { paymentService } from '../services/paymentService';

export interface CreateProductDraft {
  title: string;
  description: string;
  price: number;
  currency: CurrencyCode;
  accessType: AccessType;
  coverImage?: string;
  previewBlurUrl?: string;
  files: ProductFile[];
  requiresAgeGate: boolean;
  contentPolicyAccepted: boolean;
  customShareSlug: string;
  tags: string[];
}

const DEFAULT_DRAFT: CreateProductDraft = {
  title: '',
  description: '',
  price: 25.00,
  currency: 'AED',
  accessType: 'blurred',
  files: [],
  requiresAgeGate: false,
  contentPolicyAccepted: true,
  customShareSlug: '',
  tags: []
};

interface ProductContextType {
  products: Product[];
  purchases: Purchase[];
  permissions: AccessPermission[];
  activities: ActivityItem[];
  draft: CreateProductDraft;
  updateDraft: (updates: Partial<CreateProductDraft>) => void;
  addDraftFiles: (files: ProductFile[]) => void;
  removeDraftFile: (fileId: string) => void;
  reorderDraftFiles: (startIndex: number, endIndex: number) => void;
  resetDraft: () => void;
  publishDraft: () => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  hasAccess: (productId: string) => boolean;
  recordPurchase: (purchase: Purchase, permission: AccessPermission) => void;
  clearAllData: () => void;
  refreshData: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Clean out old pre-populated demo items from previous session if found
function getCleanInitialProducts(): Product[] {
  const saved = dbService.getProducts();
  if (saved && saved.length > 0) {
    // Filter out old hardcoded demo products
    const filtered = saved.filter(
      (p) => !['prod_summer_photos', 'prod_bts_reel', 'prod_creator_pack'].includes(p.id)
    );
    if (filtered.length !== saved.length) {
      dbService.saveProducts(filtered);
    }
    return filtered;
  }
  return [];
}

function getCleanInitialPurchases(): Purchase[] {
  const saved = dbService.getPurchases();
  if (saved && saved.length > 0) {
    const filtered = saved.filter((p) => p.id !== 'purch_demo_1');
    if (filtered.length !== saved.length) {
      dbService.savePurchases(filtered);
    }
    return filtered;
  }
  return [];
}

function getCleanInitialPermissions(): AccessPermission[] {
  const saved = dbService.getAccessPermissions();
  if (saved && saved.length > 0) {
    const filtered = saved.filter((p) => p.id !== 'perm_demo_1');
    if (filtered.length !== saved.length) {
      dbService.saveAccessPermissions(filtered);
    }
    return filtered;
  }
  return [];
}

function getCleanInitialActivities(): ActivityItem[] {
  const saved = dbService.getActivities();
  if (saved && saved.length > 0) {
    const filtered = saved.filter(
      (a) => !['act_1', 'act_2', 'act_3', 'act_4'].includes(a.id)
    );
    if (filtered.length !== saved.length) {
      dbService.saveActivities(filtered);
    }
    return filtered;
  }
  return [];
}

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => getCleanInitialProducts());
  const [purchases, setPurchases] = useState<Purchase[]>(() => getCleanInitialPurchases());
  const [permissions, setPermissions] = useState<AccessPermission[]>(() => getCleanInitialPermissions());
  const [activities, setActivities] = useState<ActivityItem[]>(() => getCleanInitialActivities());
  const [draft, setDraft] = useState<CreateProductDraft>(DEFAULT_DRAFT);

  const refreshData = useCallback(() => {
    setProducts(getCleanInitialProducts());
    setPurchases(getCleanInitialPurchases());
    setPermissions(getCleanInitialPermissions());
    setActivities(getCleanInitialActivities());
  }, []);

  const clearAllData = useCallback(() => {
    localStorage.removeItem('unlockly_products');
    localStorage.removeItem('unlockly_purchases');
    localStorage.removeItem('unlockly_permissions');
    localStorage.removeItem('unlockly_activities');
    setProducts([]);
    setPurchases([]);
    setPermissions([]);
    setActivities([]);
    setDraft(DEFAULT_DRAFT);
  }, []);

  const updateDraft = (updates: Partial<CreateProductDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const addDraftFiles = (newFiles: ProductFile[]) => {
    setDraft((prev) => {
      const combined = [...prev.files, ...newFiles];
      const firstImage = combined.find((f) => f.fileType === 'photo');
      return {
        ...prev,
        files: combined,
        coverImage: prev.coverImage || firstImage?.blobDataUrl || firstImage?.previewPath || firstImage?.storagePath,
        previewBlurUrl: prev.previewBlurUrl || firstImage?.previewPath
      };
    });
  };

  const removeDraftFile = (fileId: string) => {
    setDraft((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId)
    }));
  };

  const reorderDraftFiles = (startIndex: number, endIndex: number) => {
    setDraft((prev) => {
      const result = Array.from(prev.files);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return {
        ...prev,
        files: result.map((item, index) => ({ ...item, order: index + 1 }))
      };
    });
  };

  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT);
  };

  const publishDraft = async (): Promise<Product> => {
    const productId = 'prod_' + Math.random().toString(36).substring(2, 9) + Date.now();
    const slug = draft.customShareSlug || draft.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30) || 'exclusive';

    const newProduct: Product = {
      id: productId,
      creatorId: user?.id || 'usr_riyaz_creator',
      creatorName: user?.name || 'Riyaz Ahmed',
      creatorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      creatorHandle: user?.handle || 'riyaz_creates',
      title: draft.title || 'EXCLUSIVE CONTENT',
      description: draft.description || 'Exclusive private digital access.',
      price: Number(draft.price) || 0,
      currency: draft.currency || 'AED',
      status: 'active',
      accessType: draft.accessType || 'blurred',
      coverImage: draft.coverImage || draft.files[0]?.blobDataUrl || draft.files[0]?.previewPath || '',
      previewBlurUrl: draft.previewBlurUrl || draft.files[0]?.previewPath,
      files: draft.files,
      unlocksCount: 0,
      totalEarned: 0,
      requiresAgeGate: draft.requiresAgeGate,
      contentPolicyAccepted: draft.contentPolicyAccepted,
      customShareSlug: slug,
      tags: draft.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    dbService.saveProducts(nextProducts);

    // Record activity
    const nextActivities: ActivityItem[] = [
      {
        id: 'act_' + Date.now(),
        type: 'created',
        productId: newProduct.id,
        productTitle: newProduct.title,
        timestamp: 'Just now'
      },
      ...activities
    ];
    setActivities(nextActivities);
    dbService.saveActivities(nextActivities);

    resetDraft();
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const nextProducts = products.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    setProducts(nextProducts);
    dbService.saveProducts(nextProducts);
  };

  const deleteProduct = (id: string) => {
    const nextProducts = products.filter((p) => p.id !== id);
    setProducts(nextProducts);
    dbService.saveProducts(nextProducts);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id || p.customShareSlug === id);
  };

  const hasAccess = (productId: string): boolean => {
    if (!user) return false;
    const product = getProductById(productId);
    if (product && user.id === product.creatorId) return true;

    return paymentService.verifyAccess(productId, user.id) || paymentService.verifyAccess(productId, user.email);
  };

  const recordPurchase = (purchase: Purchase, permission: AccessPermission) => {
    setPurchases((prev) => [purchase, ...prev]);
    setPermissions((prev) => [permission, ...prev]);
    refreshData();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        purchases,
        permissions,
        activities,
        draft,
        updateDraft,
        addDraftFiles,
        removeDraftFile,
        reorderDraftFiles,
        resetDraft,
        publishDraft,
        updateProduct,
        deleteProduct,
        getProductById,
        hasAccess,
        recordPurchase,
        clearAllData,
        refreshData
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};
