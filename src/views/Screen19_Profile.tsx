import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { WalletIcon, CreditCardIcon, LibraryIcon, ShieldIcon, SettingsIcon, TrashIcon } from '../assets/icons/Icons';

export const Screen19_Profile: React.FC = () => {
  const { user, logout, switchRole, updateProfile } = useAuth();
  const { clearAllData } = useProducts();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [ibanInput, setIbanInput] = useState(user?.payoutIban || 'AE07 0331 2345 6789 0123 456');

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ payoutIban: ibanInput });
    setIsPayoutModalOpen(false);
    showToast('Payout bank details updated', undefined, 'success');
  };

  const handleClearData = () => {
    clearAllData();
    showToast('All local storage cleared', undefined, 'info');
    navigateTo('home');
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out of Unlockly', undefined, 'info');
    navigateTo('welcome');
  };

  return (
    <div className="app-content p-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Profile Header Card */}
      <div
        className="surface-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px'
        }}
      >
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt={user?.name || 'User'}
          style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            {user?.name || 'Creator'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            @{user?.handle || 'creator'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {user?.email || 'No email connected'}
          </div>
        </div>
      </div>

      {/* Role Switcher Widget */}
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
            CURRENT MODE: {user?.role === 'creator' ? 'CREATOR' : 'BUYER'}
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
            <TrashIcon size={19} className="text-red-500" />
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-danger)' }}>
              CLEAR ALL STORED DATA
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
