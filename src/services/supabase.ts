import { createClient } from '@supabase/supabase-js';
import { Product, ProductFile, Purchase, AccessPermission, User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const supabaseService = {
  // --- Auth Services ---
  async signUp(email: string, password?: string) {
    if (!supabase) return null;
    if (password) {
      return await supabase.auth.signUp({ email, password });
    }
    // Passwordless magic link
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
  },

  async signIn(email: string, password?: string) {
    if (!supabase) return null;
    if (password) {
      return await supabase.auth.signInWithPassword({ email, password });
    }
    return await supabase.auth.signInWithOtp({ email });
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch user profile from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      name: profile?.name || user.email?.split('@')[0] || 'Creator',
      email: user.email || '',
      avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      handle: profile?.handle || user.email?.split('@')[0] || 'creator',
      role: profile?.role || 'creator',
      balance: profile?.balance || 0,
      totalEarnings: profile?.total_earnings || 0,
      currency: profile?.currency || 'AED',
      payoutIban: profile?.payout_iban,
      createdAt: user.created_at
    };
  },

  // --- Cloud Storage Bucket (unlockly-vault) ---
  async uploadFileToVault(file: File, path: string): Promise<string | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.storage
      .from('unlockly-vault')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return null;
    }
    return data.path;
  },

  async getSignedDownloadUrl(path: string, expiresInSeconds: number = 3600): Promise<string | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.storage
      .from('unlockly-vault')
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    return data.signedUrl;
  },

  // --- Products Database ---
  async getProducts(): Promise<Product[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*, files:product_files(*)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      creatorAvatar: row.creator_avatar,
      creatorHandle: row.creator_handle,
      title: row.title,
      description: row.description,
      price: row.price,
      currency: row.currency,
      status: row.status,
      accessType: row.access_type,
      coverImage: row.cover_image,
      previewBlurUrl: row.preview_blur_url,
      unlocksCount: row.unlocks_count || 0,
      totalEarned: row.total_earned || 0,
      requiresAgeGate: row.requires_age_gate || false,
      contentPolicyAccepted: row.content_policy_accepted || true,
      customShareSlug: row.custom_share_slug,
      tags: row.tags || [],
      files: (row.files || []).map((f: any) => ({
        id: f.id,
        productId: f.product_id,
        name: f.name,
        fileType: f.file_type,
        fileSize: f.file_size,
        storagePath: f.storage_path,
        previewPath: f.preview_path,
        mimeType: f.mime_type,
        order: f.order_index,
        isPreviewAllowed: f.is_preview_allowed,
        createdAt: f.created_at
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async createProduct(product: Product): Promise<boolean> {
    if (!supabase) return false;

    // 1. Insert product record
    const { error: prodError } = await supabase.from('products').insert({
      id: product.id,
      creator_id: product.creatorId,
      creator_name: product.creatorName,
      creator_avatar: product.creatorAvatar,
      creator_handle: product.creatorHandle,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      status: product.status,
      access_type: product.accessType,
      cover_image: product.coverImage,
      preview_blur_url: product.previewBlurUrl,
      requires_age_gate: product.requiresAgeGate,
      content_policy_accepted: product.contentPolicyAccepted,
      custom_share_slug: product.customShareSlug,
      tags: product.tags
    });

    if (prodError) {
      console.error('Error creating product in Supabase:', prodError);
      return false;
    }

    // 2. Insert product files
    if (product.files.length > 0) {
      const fileRows = product.files.map((f) => ({
        id: f.id,
        product_id: product.id,
        name: f.name,
        file_type: f.fileType,
        file_size: f.fileSize,
        storage_path: f.storagePath,
        preview_path: f.previewPath,
        mime_type: f.mimeType,
        order_index: f.order,
        is_preview_allowed: f.isPreviewAllowed
      }));

      const { error: filesError } = await supabase.from('product_files').insert(fileRows);
      if (filesError) {
        console.error('Error inserting product files:', filesError);
      }
    }

    return true;
  },

  // --- Purchase & Access Permission Record ---
  async recordPurchase(purchase: Purchase, permission: AccessPermission): Promise<boolean> {
    if (!supabase) return false;

    await supabase.from('purchases').insert({
      id: purchase.id,
      product_id: purchase.productId,
      buyer_id: purchase.buyerId,
      buyer_name: purchase.buyerName,
      buyer_email: purchase.buyerEmail,
      amount: purchase.amount,
      currency: purchase.currency,
      payment_provider: purchase.paymentId,
      status: purchase.status
    });

    await supabase.from('access_permissions').insert({
      id: permission.id,
      product_id: permission.productId,
      user_id: permission.userId,
      access_token: permission.accessToken,
      is_active: permission.accessStatus === 'granted',
      expires_at: permission.expiresAt
    });

    // Increment unlock counter on product
    await supabase.rpc('increment_product_sales', {
      p_id: purchase.productId,
      p_amount: purchase.amount
    });

    return true;
  }
};
