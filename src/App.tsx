import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

import { AppHeader } from './components/layout/AppHeader';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { PwaInstallPrompt } from './components/modals/PwaInstallPrompt';

import { Screen1_Welcome } from './views/Screen1_Welcome';
import { Screen2_Auth } from './views/Screen2_Auth';
import { Screen3_Home } from './views/Screen3_Home';
import { Screen4_CreateContent } from './views/Screen4_CreateContent';
import { Screen5_ContentPreview } from './views/Screen5_ContentPreview';
import { Screen6_AccessSettings } from './views/Screen6_AccessSettings';
import { Screen7_Pricing } from './views/Screen7_Pricing';
import { Screen8_Publish } from './views/Screen8_Publish';
import { Screen9_SuccessShare } from './views/Screen9_SuccessShare';
import { Screen10_PublicContent } from './views/Screen10_PublicContent';
import { Screen14_PaymentSuccess } from './views/Screen14_PaymentSuccess';
import { Screen15_UnlockedContent } from './views/Screen15_UnlockedContent';
import { Screen16_Library } from './views/Screen16_Library';
import { Screen17_ProductManagement } from './views/Screen17_ProductManagement';
import { Screen18_CreatorOverview } from './views/Screen18_CreatorOverview';
import { Screen19_Profile } from './views/Screen19_Profile';
import { Screen20_EmptyStatesDemo } from './views/Screen20_EmptyStatesDemo';

const MainAppContent: React.FC = () => {
  const { currentScreen, viewportMode } = useNavigation();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <Screen1_Welcome />;
      case 'auth':
        return <Screen2_Auth />;
      case 'home':
        return <Screen3_Home />;
      case 'create_step1':
        return <Screen4_CreateContent />;
      case 'create_step2':
        return <Screen5_ContentPreview />;
      case 'create_step3':
        return <Screen6_AccessSettings />;
      case 'create_step4':
        return <Screen7_Pricing />;
      case 'create_step5':
        return <Screen8_Publish />;
      case 'publish_success':
        return <Screen9_SuccessShare />;
      case 'public_product':
        return <Screen10_PublicContent />;
      case 'payment_success':
        return <Screen14_PaymentSuccess />;
      case 'unlocked_content':
        return <Screen15_UnlockedContent />;
      case 'library':
        return <Screen16_Library />;
      case 'product_manage':
        return <Screen17_ProductManagement />;
      case 'creator_overview':
        return <Screen18_CreatorOverview />;
      case 'profile':
        return <Screen19_Profile />;
      case 'empty_states_demo':
        return <Screen20_EmptyStatesDemo />;
      default:
        return <Screen3_Home />;
    }
  };

  const showHeader = currentScreen !== 'welcome';

  let shellClass = 'mobile-shell';
  if (viewportMode === 'desktop') shellClass += ' desktop-expanded';
  if (viewportMode === 'fullscreen') shellClass += ' fullscreen-view';

  return (
    <div className="app-viewport">
      <div className={shellClass}>
        {showHeader && <AppHeader />}
        {renderActiveScreen()}
        <BottomNavigation />
        <PwaInstallPrompt />
      </div>
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductProvider>
          <NavigationProvider>
            <MainAppContent />
          </NavigationProvider>
        </ProductProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
