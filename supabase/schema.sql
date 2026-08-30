-- ==============================================================================
-- UNLOCKLY SUPABASE DATABASE SCHEMA
-- Run this in your Supabase Project Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar TEXT,
  handle TEXT UNIQUE,
  role TEXT DEFAULT 'creator' CHECK (role IN ('creator', 'buyer')),
  balance NUMERIC(10, 2) DEFAULT 0.00,
  total_earnings NUMERIC(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'AED',
  payout_iban TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Products Table (Private Drops & Unlocks)
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

-- 3. Create Product Files Table
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

-- 4. Create Purchases Table
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

-- 5. Create Access Permissions Table (Content Gating Tokens)
CREATE TABLE IF NOT EXISTS public.access_permissions (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  user_id TEXT,
  user_email TEXT,
  access_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Helper RPC Function to atomically increment creator earnings
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

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_permissions ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies: Public Read Access for active products, Teasers only
CREATE POLICY "Public products can be viewed by anyone" 
  ON public.products FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage their own products" 
  ON public.products FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Product files visible to public" 
  ON public.product_files FOR SELECT USING (TRUE);

-- 9. Private Storage Bucket Setup for Raw High-Res Media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('unlockly-vault', 'unlockly-vault', false)
ON CONFLICT (id) DO NOTHING;
