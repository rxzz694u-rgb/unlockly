import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import {
  WalletIcon,
  CreditCardIcon,
  LibraryIcon,
  ShieldIcon,
  SettingsIcon,
  TrashIcon,
  EditIcon,
  GoogleIcon
} from '../assets/icons/Icons';

export const Screen19_Profile: React.FC = () => {
  const { user, logout, switchRole, updateProfile, isCloudConnected } = useAuth();
  const { clearAllData } = useProducts();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Dynamic user details
  const displayName = user?.displayName || user?.name || (user?.email ? user.email.split('@')[0] : 'Creator');
  const userEmail = user?.email || '';
  const userHandle = user?.handle || (user?.email ? user.email.split('@')[0] : 'creator');
  const avatar = user?.avatarUrl || user?.avatar || '';

  const hasValidAvatar = Boolean(
    avatar &&
    !avatar.includes('unsplash.com') &&
    avatar.trim().length > 0 &&
    (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:'))
  );

  // Edit profile form state
  const [displayNameInput, setDisplayNameInput] = useState(displayName);
  const [avatarUrlInput, setAvatarUrlInput] = useState(hasValidAvatar ? avatar : '');
  const [handleInput, setHandleInput] = useState(userHandle);
  const [ibanInput, setIbanInput] = useState(user?.payoutIban || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayNameInput(displayName);
    setAvatarUrlInput(hasValidAvatar ? avatar : '');
    setHandleInput(userHandle);
  }, [user]);

  const getInitials = (name?: string) => {
    if (!name || name === 'Creator') {
      if (userEmail) return userEmail.slice(0, 2).toUpperCase();
      return 'CR';
    }
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({
        name: displayNameInput.trim(),
        displayName: displayNameInput.trim(),
        avatar: avatarUrlInput.trim(),
        avatarUrl: avatarUrlInput.trim(),
        handle: handleInput.trim()
      });

      setIsSaving(false);
      setIsEditProfileOpen(false);
      showToast('Profile updated & saved to cloud', undefined, 'success');
    } catch (err: any) {
      setIsSaving(false);
      showToast('Error updating profile', err?.message, 'error');
    }
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ payoutIban: ibanInput });
    setIsPayoutModalOpen(false);
    showToast('Payout bank details updated', undefined, 'success');
  };

  const handleClearData = () => {
    clearAllData();
    localStorage.clear();
    showToast('All local cache cleared', undefined, 'info');
    navigateTo('home');
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out of Unlockly', undefined, 'info');
    navigateTo('welcome');
  };

  return (
    <div className="app-content p-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Profile Header Card */}
      <div
        className="surface-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {hasValidAvatar ? (
            <img
              src={avatar}
              alt={displayName}
              style={{
                width: 68,
                height: 68,
                borderRadius: 'var(--radius-full)',
                objectFit: 'cover',
                border: '2px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
          ) : (
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#111111',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {getInitials(displayName)}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {displayName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              @{userHandle}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail ? userEmail : 'No email connected'}
            </div>
          </div>
        </div>

        {/* Sync Status Badge & Edit Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-secondary)' }}>
            {user?.authProvider === 'google' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#111111', fontWeight: 600 }}>
                <GoogleIcon size={14} />
                {user.isCustomProfile ? 'Google Auth (Custom Profile)' : 'Google OAuth Synced'}
              </span>
            ) : (
              <span>{user?.isCustomProfile ? 'Custom Profile' : userEmail ? 'Email Account' : 'Guest Session'}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setDisplayNameInput(displayName);
              setAvatarUrlInput(hasValidAvatar ? avatar : '');
              setHandleInput(userHandle);
              setIsEditProfileOpen(true);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              color: '#111111',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              textTransform: 'uppercase'
            }}
          >
            <EditIcon size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Role Switcher Simulation */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase' }}>
            CURRENT ROLE: {user?.role === 'creator' ? 'CREATOR' : 'BUYER'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
            Switch to test from different user perspectives
          </div>
        </div>

        <button
          type="button"
          onClick={() => switchRole(user?.role === 'creator' ? 'buyer' : 'creator')}
          style={{
            backgroundColor: '#111111',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '8px 14px',
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          SWITCH TO {user?.role === 'creator' ? 'BUYER' : 'CREATOR'}
        </button>
      </div>

      {/* Settings Menu List */}
      <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          onClick={() => setIsPayoutModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <WalletIcon size={19} />
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>PAYOUTS & BANK IBAN</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
        </div>

        <div
          onClick={() => navigateTo('library')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LibraryIcon size={19} />
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>PURCHASE HISTORY & VAULT</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
        </div>

        <div
          onClick={() => navigateTo('creator_overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CreditCardIcon size={19} />
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>EARNINGS & ANALYTICS</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
        </div>

        <div
          onClick={() => navigateTo('empty_states_demo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SettingsIcon size={19} />
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>EMPTY STATES DEMO</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
        </div>

        <div
          onClick={() => setIsLegalModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldIcon size={19} />
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>LEGAL, PRIVACY & DMCA</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
        </div>

        <div
          onClick={handleClearData}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TrashIcon size={19} />
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-danger)' }}>
              CLEAR LOCAL CACHE
            </span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
        </div>
      </div>

      {/* Logout Action */}
      <div>
        <Button variant="secondary" onClick={handleLogout}>
          LOG OUT
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="EDIT PROFILE">
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Updating your profile sets custom details that won't be overwritten by future Google logins.
          </p>

          <Input
            label="DISPLAY NAME"
            value={displayNameInput}
            onChange={(e) => setDisplayNameInput(e.target.value)}
            placeholder="e.g. Riyaz Ahmed"
            required
          />

          <Input
            label="USERNAME HANDLE"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            placeholder="e.g. riyaz_creates"
            required
          />

          <Input
            label="CUSTOM AVATAR IMAGE URL (OPTIONAL)"
            value={avatarUrlInput}
            onChange={(e) => setAvatarUrlInput(e.target.value)}
            placeholder="https://..."
          />

          <Button variant="primary" type="submit" isLoading={isSaving}>
            SAVE CHANGES
          </Button>
        </form>
      </Modal>

      {/* Payout Settings Modal */}
      <Modal isOpen={isPayoutModalOpen} onClose={() => setIsPayoutModalOpen(false)} title="PAYOUT SETTINGS">
        <form onSubmit={handleSavePayout} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Earnings are automatically dispatched to your IBAN account after each unlock transaction.
          </p>

          <Input
            label="BANK IBAN NUMBER"
            value={ibanInput}
            onChange={(e) => setIbanInput(e.target.value)}
            placeholder="AE00 0000 0000 0000 0000 000"
            required
          />

          <Button variant="primary" type="submit">
            UPDATE IBAN
          </Button>
        </form>
      </Modal>

      {/* Legal & Terms Modal */}
      <Modal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} title="LEGAL & PRIVACY">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase' }}>1. CREATOR OWNERSHIP</h4>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Creators retain 100% intellectual property rights over all uploaded digital files. Unlockly grants non-exclusive license delivery upon authorization.
          </p>

          <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase' }}>2. ZERO-KNOWLEDGE ENCRYPTION</h4>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Protected original media assets are isolated in secure private storage. Preview representations are low-resolution blurred derivatives.
          </p>

          <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase' }}>3. DMCA & ABUSE POLICY</h4>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Prohibited content is subject to immediate removal and account termination upon verified abuse reports.
          </p>

          <Button variant="primary" onClick={() => setIsLegalModalOpen(false)} style={{ marginTop: 8 }}>
            CLOSE
          </Button>
        </div>
      </Modal>
    </div>
  );
};
