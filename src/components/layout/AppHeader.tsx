import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon, LockIcon, DevicePhoneIcon, DeviceDesktopIcon, SparklesIcon } from '../../assets/icons/Icons';
import { IconButton } from '../common/IconButton';

export const AppHeader: React.FC = () => {
  const { currentScreen, goBack, navigateTo, viewportMode, setViewportMode } = useNavigation();
  const { user, switchRole } = useAuth();

  const isMainTab = ['home', 'library', 'profile'].includes(currentScreen);
  const isPublicPage = currentScreen === 'public_product';

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'create_step1': return 'Step 1 of 5';
      case 'create_step2': return 'Preview & Order';
      case 'create_step3': return 'Access Settings';
      case 'create_step4': return 'Set Price';
      case 'create_step5': return 'Publish';
      case 'product_manage': return 'Manage Link';
      case 'creator_overview': return 'Earnings & Stats';
      case 'unlocked_content': return 'Unlocked Media';
      case 'library': return 'Your Library';
      case 'profile': return 'Profile';
      case 'empty_states_demo': return 'Empty States';
      default: return 'UNLOCKLY';
    }
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!isMainTab && currentScreen !== 'welcome' && (
          <IconButton
            variant="subtle"
            size={36}
            onClick={goBack}
            aria-label="Back"
          >
            <ChevronLeftIcon size={20} />
          </IconButton>
        )}

        {isMainTab && (
          <div
            onClick={() => navigateTo('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#111111',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LockIcon size={15} />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)'
              }}
            >
              UNLOCKLY
            </span>
          </div>
        )}

        {!isMainTab && currentScreen !== 'welcome' && (
          <span
            style={{
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}
          >
            {getScreenTitle()}
          </span>
        )}
      </div>

      {/* Right Header Action Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Quick Role Switcher Pill */}
        <button
          type="button"
          onClick={() => switchRole(user?.role === 'creator' ? 'buyer' : 'creator')}
          title="Toggle Creator vs Buyer simulation"
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: user?.role === 'creator' ? '#111111' : '#E4E4E0',
            color: user?.role === 'creator' ? '#FFFFFF' : '#111111',
            border: 'none',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: user?.role === 'creator' ? '#10B981' : '#777777'
            }}
          />
          {user?.role === 'creator' ? 'Creator' : 'Buyer'}
        </button>

        {/* Viewport size switcher on desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            variant="subtle"
            size={32}
            title={viewportMode === 'mobile' ? 'Switch to Expanded View' : 'Switch to Mobile View'}
            onClick={() => setViewportMode(viewportMode === 'mobile' ? 'desktop' : 'mobile')}
          >
            {viewportMode === 'mobile' ? <DeviceDesktopIcon size={16} /> : <DevicePhoneIcon size={16} />}
          </IconButton>
        </div>
      </div>
    </header>
  );
};
