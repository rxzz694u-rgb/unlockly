-- ==============================================================================
-- UNLOCKLY SUPABASE DATABASE SCHEMA (PROD)
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  handle TEXT UNIQUE,
  role TEXT DEFAULT 'creator' CHECK (role IN ('creator', 'buyer')),
  auth_provider TEXT DEFAULT 'google',
  is_custom_profile BOOLEAN DEFAULT FALSE,
  balance NUMERIC(10, 2) DEFAULT 0.00,
  total_earnings NUMERIC(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'AED',
  payout_iban TEXT,
  payout_method TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Auto-create & Sync Profile on Signup/OAuth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_display_name TEXT;
  v_avatar_url TEXT;
  v_handle TEXT;
BEGIN
  -- Extract Google/OAuth display name & avatar from raw_user_meta_data
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  v_handle := LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)), '[^a-zA-Z0-9_]', '_', 'g'));

  INSERT INTO public.profiles (
    id,
    display_name,
    avatar_url,
    email,
    handle,
    auth_provider,
    is_custom_profile,
    last_synced_at
  )
  VALUES (
    NEW.id,
    v_display_name,
    v_avatar_url,
    NEW.email,
    v_handle,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'google'),
    FALSE,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = CASE WHEN public.profiles.is_custom_profile THEN public.profiles.display_name ELSE EXCLUDED.display_name END,
    avatar_url = CASE WHEN public.profiles.is_custom_profile THEN public.profiles.avatar_url ELSE EXCLUDED.avatar_url END,
    last_synced_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create Products Table (Private Drops & Unlocks)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES auth.users ON DELETE CASCADE,
  creator_name TEXT,
  creator_avatar TEXT,
  creator_handle TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  currency TEXT DEFAULT 'AED',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  access_type TEXT DEFAULT 'blurred' CHECK (access_type IN ('blurred', 'locked', 'teaser')),
  cover_image TEXT,
  preview_blur_url TEXT,
  unlocks_count INTEGER DEFAULT 0,
  total_earned NUMERIC(10, 2) DEFAULT 0.00,
  requires_age_gate BOOLEAN DEFAULT FALSE,
  content_policy_accepted BOOLEAN DEFAULT TRUE,
  custom_share_slug TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Product Files Table
CREATE TABLE IF NOT EXISTS public.product_files (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('photo', 'video', 'document', 'archive', 'audio')),
  file_size BIGINT DEFAULT 0,
  storage_path TEXT NOT NULL,
  preview_path TEXT,
  mime_type TEXT,
  order_index INTEGER DEFAULT 1,
  is_preview_allowed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id TEXT,
  buyer_name TEXT,
  buyer_email TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  payment_provider TEXT DEFAULT 'card',
  status TEXT DEFAULT 'successful',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Access Permissions Table (Content Gating Tokens)
CREATE TABLE IF NOT EXISTS public.access_permissions (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  user_id TEXT,
  access_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Helper RPC Function to increment product sales and creator balance
CREATE OR REPLACE FUNCTION public.increment_product_sales(p_id TEXT, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET unlocks_count = unlocks_count + 1,
      total_earned = total_earned + p_amount,
      updated_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_permissions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are readable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by anyone"
  ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products Policies
DROP POLICY IF EXISTS "Public products can be viewed by anyone" ON public.products;
CREATE POLICY "Public products can be viewed by anyone" 
  ON public.products FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Creators can manage their own products" ON public.products;
CREATE POLICY "Creators can manage their own products" 
  ON public.products FOR ALL USING (auth.uid() = creator_id);

-- Product Files Policies
DROP POLICY IF EXISTS "Product files visible to public" ON public.product_files;
CREATE POLICY "Product files visible to public" 
  ON public.product_files FOR SELECT USING (TRUE);

-- 9. Private Storage Bucket Setup for Raw High-Res Media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('unlockly-vault', 'unlockly-vault', false)
ON CONFLICT (id) DO NOTHING;
