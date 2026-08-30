import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductFile, Purchase, AccessPermission, CurrencyCode, AccessType, ActivityItem } from '../types';
import { dbService } from '../services/db';
import { useAuth } from './AuthContext';
import { paymentService } from '../services/paymentService';
import { isSupabaseConfigured, supabaseService } from '../services/supabase';
import { nanoid } from 'nanoid';

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
  isCloudSyncing: boolean;
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

function getCleanInitialProducts(): Product[] {
  const saved = dbService.getProducts();
  if (saved && saved.length > 0) {
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

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => getCleanInitialProducts());
  const [purchases, setPurchases] = useState<Purchase[]>(() => dbService.getPurchases());
  const [permissions, setPermissions] = useState<AccessPermission[]>(() => dbService.getAccessPermissions());
  const [activities, setActivities] = useState<ActivityItem[]>(() => dbService.getActivities());
  const [draft, setDraft] = useState<CreateProductDraft>(DEFAULT_DRAFT);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Sync with Supabase on startup if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      setIsCloudSyncing(true);
      supabaseService.getProducts().then((cloudProducts) => {
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
          dbService.saveProducts(cloudProducts);
        }
        setIsCloudSyncing(false);
      }).catch(() => setIsCloudSyncing(false));
    }
  }, []);

  const refreshData = useCallback(() => {
    setProducts(getCleanInitialProducts());
    setPurchases(dbService.getPurchases());
    setPermissions(dbService.getAccessPermissions());
    setActivities(dbService.getActivities());
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
    const cleanCustom = draft.customShareSlug?.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const slug = cleanCustom || nanoid(8);
    const productId = slug;

    const newProduct: Product = {
      id: productId,
      creatorId: user?.id || 'usr_' + Date.now(),
      creatorName: user?.displayName || user?.name || 'Creator',
      creatorAvatar: user?.avatarUrl || user?.avatar || '',
      creatorHandle: user?.handle || 'creator',
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

    // Save to Supabase Cloud if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseService.createProduct(newProduct);
      } catch (err) {
        console.warn('Supabase cloud product save warning:', err);
      }
    }

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
    if (isSupabaseConfigured()) {
      supabaseService.recordPurchase(purchase, permission).catch(console.warn);
    }
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
        isCloudSyncing,
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
