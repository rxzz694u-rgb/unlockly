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

  // Handle URL hash & pathname changes (e.g. #/u/xyz123, /u/xyz123, #/p/prod_123)
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;

      if (hash.startsWith('#/u/')) {
        const slug = hash.replace('#/u/', '').split('?')[0];
        if (slug) {
          setActiveSlug(slug);
          setCurrentScreen('direct_unlock');
          return;
        }
      } else if (pathname.startsWith('/u/')) {
        const slug = pathname.replace('/u/', '').split('?')[0];
        if (slug) {
          setActiveSlug(slug);
          setCurrentScreen('direct_unlock');
          return;
        }
      } else if (hash.startsWith('#/p/')) {
        const id = hash.replace('#/p/', '').split('?')[0];
        if (id) {
          setActiveProductId(id);
          setCurrentScreen('public_product');
          return;
        }
      } else if (hash === '#/welcome') {
        setCurrentScreen('welcome');
      } else if (hash === '#/library') {
        setCurrentScreen('library');
        setActiveTabState('library');
      } else if (hash === '#/auth') {
        setCurrentScreen('auth');
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
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

    setHistoryStack((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const goBack = useCallback(() => {
    setHistoryStack((prev) => {
      if (prev.length <= 1) {
        setCurrentScreen('home');
        setActiveTabState('home');
        return ['home'];
      }
      const newStack = [...prev];
      newStack.pop();
      const previousScreen = newStack[newStack.length - 1];
      setCurrentScreen(previousScreen);

      if (previousScreen === 'home') setActiveTabState('home');
      if (previousScreen === 'library') setActiveTabState('library');
      if (previousScreen === 'profile') setActiveTabState('profile');

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
    window.location.hash = `#/p/${productId}`;
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
