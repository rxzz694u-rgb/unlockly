import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ScreenId =
  | 'welcome'
  | 'auth'
  | 'home'
  | 'create_step1'
  | 'create_step2'
  | 'create_step3'
  | 'create_step4'
  | 'create_step5'
  | 'publish_success'
  | 'public_product'
  | 'direct_unlock'
  | 'access_gate'
  | 'checkout'
  | 'payment_processing'
  | 'payment_success'
  | 'unlocked_content'
  | 'library'
  | 'product_manage'
  | 'creator_overview'
  | 'profile'
  | 'empty_states_demo';

export type BottomNavTab = 'home' | 'create' | 'library' | 'profile';
export type ViewportMode = 'mobile' | 'tablet' | 'desktop' | 'fullscreen';

interface NavigationContextType {
  currentScreen: ScreenId;
  activeTab: BottomNavTab;
  activeProductId: string | null;
  activeSlug: string | null;
  viewportMode: ViewportMode;
  publishedProduct: any | null;
  historyStack: ScreenId[];
  navigateTo: (screen: ScreenId, params?: { productId?: string; publishedProduct?: any; slug?: string }) => void;
  goBack: () => void;
  setActiveTab: (tab: BottomNavTab) => void;
  setViewportMode: (mode: ViewportMode) => void;
  openPublicProduct: (productId: string) => void;
  openProductManage: (productId: string) => void;
  openUnlockedViewer: (productId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [activeTab, setActiveTabState] = useState<BottomNavTab>('home');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [publishedProduct, setPublishedProduct] = useState<any | null>(null);
  const [historyStack, setHistoryStack] = useState<ScreenId[]>(['home']);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('mobile');

  // Real Path Routing Parser (reads window.location.pathname)
  useEffect(() => {
    const handleRoute = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      // 1. Path-based routing: /p/:slug (Public Drop)
      if (pathname.startsWith('/p/')) {
        const slug = pathname.replace('/p/', '').split('?')[0].split('/')[0];
        if (slug) {
          setActiveProductId(slug);
          setCurrentScreen('public_product');
          return;
        }
      }

      // 2. Path-based routing: /u/:slug (Direct Unlock)
      if (pathname.startsWith('/u/')) {
        const slug = pathname.replace('/u/', '').split('?')[0].split('/')[0];
        if (slug) {
          setActiveSlug(slug);
          setCurrentScreen('direct_unlock');
          return;
        }
      }

      // 3. Fallback for legacy hash links (auto-upgrade to real path routing)
      if (hash.startsWith('#/p/')) {
        const slug = hash.replace('#/p/', '').split('?')[0];
        if (slug) {
          window.history.replaceState(null, '', `/p/${slug}`);
          setActiveProductId(slug);
          setCurrentScreen('public_product');
          return;
        }
      } else if (hash.startsWith('#/u/')) {
        const slug = hash.replace('#/u/', '').split('?')[0];
        if (slug) {
          window.history.replaceState(null, '', `/u/${slug}`);
          setActiveSlug(slug);
          setCurrentScreen('direct_unlock');
          return;
        }
      }

      // 4. Standard App Paths
      if (pathname === '/welcome' || hash === '#/welcome') {
        setCurrentScreen('welcome');
      } else if (pathname === '/auth' || hash === '#/auth') {
        setCurrentScreen('auth');
      } else if (pathname === '/library' || hash === '#/library') {
        setCurrentScreen('library');
        setActiveTabState('library');
      } else if (pathname === '/profile' || hash === '#/profile') {
        setCurrentScreen('profile');
        setActiveTabState('profile');
      } else if (pathname === '/overview' || pathname === '/stats') {
        setCurrentScreen('creator_overview');
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);
    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
    };
  }, []);

  const navigateTo = useCallback((screen: ScreenId, params?: { productId?: string; publishedProduct?: any; slug?: string }) => {
    if (params?.productId) {
      setActiveProductId(params.productId);
    }
    if (params?.publishedProduct) {
      setPublishedProduct(params.publishedProduct);
    }
    if (params?.slug) {
      setActiveSlug(params.slug);
    }

    // Sync active tab with main screens
    if (screen === 'home') setActiveTabState('home');
    if (screen.startsWith('create_')) setActiveTabState('create');
    if (screen === 'library') setActiveTabState('library');
    if (screen === 'profile') setActiveTabState('profile');

    // Update browser URL using clean path routing
    try {
      if (screen === 'public_product' && params?.productId) {
        window.history.pushState(null, '', `/p/${params.productId}`);
      } else if (screen === 'direct_unlock' && params?.slug) {
        window.history.pushState(null, '', `/u/${params.slug}`);
      } else if (screen === 'home') {
        window.history.pushState(null, '', '/');
      } else if (screen === 'profile') {
        window.history.pushState(null, '', '/profile');
      } else if (screen === 'library') {
        window.history.pushState(null, '', '/library');
      } else if (screen === 'welcome') {
        window.history.pushState(null, '', '/welcome');
      } else if (screen === 'auth') {
        window.history.pushState(null, '', '/auth');
      }
    } catch {
      // Fallback in restricted iframe environments
    }

    setHistoryStack((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const goBack = useCallback(() => {
    setHistoryStack((prev) => {
      if (prev.length <= 1) {
        setCurrentScreen('home');
        setActiveTabState('home');
        window.history.pushState(null, '', '/');
        return ['home'];
      }
      const newStack = [...prev];
      newStack.pop();
      const previousScreen = newStack[newStack.length - 1];
      setCurrentScreen(previousScreen);

      if (previousScreen === 'home') {
        setActiveTabState('home');
        window.history.pushState(null, '', '/');
      } else if (previousScreen === 'library') {
        setActiveTabState('library');
        window.history.pushState(null, '', '/library');
      } else if (previousScreen === 'profile') {
        setActiveTabState('profile');
        window.history.pushState(null, '', '/profile');
      }

      return newStack;
    });
  }, []);

  const setActiveTab = useCallback((tab: BottomNavTab) => {
    setActiveTabState(tab);
    if (tab === 'home') navigateTo('home');
    if (tab === 'create') navigateTo('create_step1');
    if (tab === 'library') navigateTo('library');
    if (tab === 'profile') navigateTo('profile');
  }, [navigateTo]);

  const openPublicProduct = useCallback((productId: string) => {
    setActiveProductId(productId);
    navigateTo('public_product', { productId });
  }, [navigateTo]);

  const openProductManage = useCallback((productId: string) => {
    setActiveProductId(productId);
    navigateTo('product_manage', { productId });
  }, [navigateTo]);

  const openUnlockedViewer = useCallback((productId: string) => {
    setActiveProductId(productId);
    navigateTo('unlocked_content', { productId });
  }, [navigateTo]);

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        activeTab,
        activeProductId,
        activeSlug,
        viewportMode,
        publishedProduct,
        historyStack,
        navigateTo,
        goBack,
        setActiveTab,
        setViewportMode,
        openPublicProduct,
        openProductManage,
        openUnlockedViewer
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
