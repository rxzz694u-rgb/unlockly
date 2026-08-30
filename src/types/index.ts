export type CurrencyCode = 'AED' | 'USD' | 'EUR' | 'GBP' | 'SAR';

export type ProductStatus = 'active' | 'paused' | 'deleted';
export type AccessType = 'blurred' | 'locked' | 'preview';
export type FileCategory = 'photo' | 'video' | 'document' | 'archive' | 'audio';

export type PaymentProvider = 'apple_pay' | 'card' | 'google_pay' | 'crypto';
export type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled' | 'refunded';
export type AccessStatus = 'granted' | 'revoked';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'creator' | 'buyer';
  handle: string;
  balance: number;
  totalEarnings: number;
  currency: CurrencyCode;
  payoutIban?: string;
  payoutMethod?: string;
  createdAt: string;
}

export interface ProductFile {
  id: string;
  productId: string;
  name: string;
  fileType: FileCategory;
  fileSize: number; // in bytes
  storagePath: string; // secure storage identifier or Blob URL
  previewPath?: string; // low-res or blurred preview
  blobDataUrl?: string; // in-memory/indexeddb resolved content
  mimeType: string;
  duration?: string; // for video/audio
  dimensions?: string; // for photos (e.g. 3840x2160)
  pageCount?: number; // for pdfs
  isPreviewAllowed?: boolean;
  order: number;
  createdAt: string;
}

export interface Product {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  title: string;
  description: string;
  price: number;
  currency: CurrencyCode;
  status: ProductStatus;
  accessType: AccessType;
  coverImage?: string;
  previewBlurUrl?: string;
  files: ProductFile[];
  unlocksCount: number;
  totalEarned: number;
  requiresAgeGate: boolean;
  contentPolicyAccepted: boolean;
  customShareSlug: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  currency: CurrencyCode;
  paymentId: string;
  amount: number;
  platformFee: number;
  creatorShare: number;
  status: PaymentStatus;
  receiptNumber: string;
  createdAt: string;
}

export interface AccessPermission {
  id: string;
  userId: string;
  productId: string;
  accessStatus: AccessStatus;
  accessToken: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface Payment {
  id: string;
  purchaseId: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  amount: number;
  currency: CurrencyCode;
  status: PaymentStatus;
  last4?: string;
  cardBrand?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'unlock' | 'view' | 'payout' | 'created';
  productId: string;
  productTitle: string;
  amount?: number;
  currency?: CurrencyCode;
  timestamp: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerAvatar?: string;
}

export interface CreatorStats {
  totalEarned: number;
  totalSales: number;
  avgPurchase: number;
  currency: CurrencyCode;
  recentActivity: ActivityItem[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
