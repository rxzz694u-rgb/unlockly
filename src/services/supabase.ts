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
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
      },
    });
  },

  async verifyOtp(email: string, token: string) {
    if (!supabase) return null;
    return await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
  },

  async signInWithGoogle() {
    if (!supabase) return null;
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  async signInWithApple() {
    if (!supabase) return null;
    return await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async syncUserProfile(authUser: any): Promise<User | null> {
    if (!supabase || !authUser) return null;

    const googleName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.user_metadata?.display_name ||
      authUser.email?.split('@')[0] ||
      'Creator';

    const googleAvatar =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      '';

    const authProvider = authUser.app_metadata?.provider || 'google';

    // 1. Fetch current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    let finalDisplayName = googleName;
    let finalAvatarUrl = googleAvatar;
    let isCustom = false;

    if (profile) {
      isCustom = profile.is_custom_profile || false;

      if (!isCustom) {
        // Live sync from OAuth metadata on login
        await supabase
          .from('profiles')
          .update({
            display_name: googleName,
            avatar_url: googleAvatar,
            email: authUser.email,
            auth_provider: authProvider,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', authUser.id);

        finalDisplayName = googleName;
        finalAvatarUrl = googleAvatar;
      } else {
        finalDisplayName = profile.display_name || googleName;
        finalAvatarUrl = profile.avatar_url || googleAvatar;
      }
    } else {
      // Create initial profile record
      const handle =
        authUser.user_metadata?.user_name ||
        authUser.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_') ||
        'creator_' + Math.random().toString(36).substring(2, 6);

      await supabase.from('profiles').insert({
        id: authUser.id,
        display_name: googleName,
        avatar_url: googleAvatar,
        email: authUser.email,
        handle: handle,
        auth_provider: authProvider,
        is_custom_profile: false,
        last_synced_at: new Date().toISOString()
      });
    }

    return {
      id: authUser.id,
      name: finalDisplayName,
      displayName: finalDisplayName,
      email: authUser.email || '',
      avatar: finalAvatarUrl || '',
      avatarUrl: finalAvatarUrl || '',
      handle: profile?.handle || authUser.email?.split('@')[0] || 'creator',
      role: profile?.role || 'creator',
      authProvider: authProvider,
      isCustomProfile: isCustom,
      balance: profile?.balance || 0,
      totalEarnings: profile?.total_earnings || 0,
      currency: profile?.currency || 'AED',
      payoutIban: profile?.payout_iban,
      payoutMethod: profile?.payout_method,
      lastSyncedAt: new Date().toISOString(),
      createdAt: authUser.created_at || new Date().toISOString()
    };
  },

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return await this.syncUserProfile(user);
  },

  async updateUserProfile(userId: string, updates: { displayName?: string; avatarUrl?: string; handle?: string; currency?: string; payoutIban?: string }): Promise<boolean> {
    if (!supabase) return false;

    const payload: any = {
      is_custom_profile: true,
      updated_at: new Date().toISOString()
    };

    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.handle !== undefined) payload.handle = updates.handle;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.payoutIban !== undefined) payload.payout_iban = updates.payoutIban;

    const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
    if (error) {
      console.error('Error updating user profile in Supabase:', error);
      return false;
    }
    return true;
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
