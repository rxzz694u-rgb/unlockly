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
  viewportMode: ViewportMode;
  publishedProduct: any | null;
  historyStack: ScreenId[];
  navigateTo: (screen: ScreenId, params?: { productId?: string; publishedProduct?: any }) => void;
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
  const [publishedProduct, setPublishedProduct] = useState<any | null>(null);
  const [historyStack, setHistoryStack] = useState<ScreenId[]>(['home']);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('mobile');

  // Handle URL hash changes (e.g. #/p/prod_summer_photos)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/p/')) {
        const id = hash.replace('#/p/', '');
        if (id) {
          setActiveProductId(id);
          setCurrentScreen('public_product');
        }
      } else if (hash === '#/welcome') {
        setCurrentScreen('welcome');
      } else if (hash === '#/library') {
        setCurrentScreen('library');
        setActiveTabState('library');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = useCallback((screen: ScreenId, params?: { productId?: string; publishedProduct?: any }) => {
    if (params?.productId) {
      setActiveProductId(params.productId);
    }
    if (params?.publishedProduct) {
      setPublishedProduct(params.publishedProduct);
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
      const nextStack = prev.slice(0, -1);
      const prevScreen = nextStack[nextStack.length - 1];
      setCurrentScreen(prevScreen);
      
      if (prevScreen === 'home') setActiveTabState('home');
      if (prevScreen === 'library') setActiveTabState('library');
      if (prevScreen === 'profile') setActiveTabState('profile');
      
      return nextStack;
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
    window.location.hash = `#/p/${productId}`;
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
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
};
