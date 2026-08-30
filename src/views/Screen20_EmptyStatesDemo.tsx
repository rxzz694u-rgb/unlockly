import React, { useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { useNavigation } from '../context/NavigationContext';
import { LockIcon, LibraryIcon, UploadIcon } from '../assets/icons/Icons';

export const Screen20_EmptyStatesDemo: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'upload'>('home');

  return (
    <div className="app-content p-page">
      <div style={{ marginBottom: 20 }}>
        <span className="text-label">DESIGN SYSTEM</span>
        <h1 className="text-headline" style={{ marginTop: 2 }}>
          EMPTY STATES
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Typography & whitespace-driven empty moments across Unlockly.
        </p>
      </div>

      {/* Tab Switcher */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: 'var(--bg-surface-subtle)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          marginBottom: 20
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          style={{
            padding: '8px 0',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'home' ? '#111111' : 'transparent',
            color: activeTab === 'home' ? '#FFFFFF' : '#777777',
            fontWeight: 800,
            fontSize: 11.5,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          HOME FEED
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          style={{
            padding: '8px 0',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'library' ? '#111111' : 'transparent',
            color: activeTab === 'library' ? '#FFFFFF' : '#777777',
            fontWeight: 800,
            fontSize: 11.5,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          LIBRARY
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '8px 0',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'upload' ? '#111111' : 'transparent',
            color: activeTab === 'upload' ? '#FFFFFF' : '#777777',
            fontWeight: 800,
            fontSize: 11.5,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          CREATION
        </button>
      </div>

      {/* Surface Showcase */}
      <div className="surface-card">
        {activeTab === 'home' && (
          <EmptyState
            title="NOTHING HERE YET."
            description="Create your first private link and start monetizing exclusive digital content."
            actionText="CREATE FIRST LINK"
            onAction={() => navigateTo('create_step1')}
            icon={<LockIcon size={26} />}
          />
        )}

        {activeTab === 'library' && (
          <EmptyState
            title="VAULT IS EMPTY."
            description="All authorized downloads and unlocked media will remain here permanently."
            actionText="DISCOVER DROPS"
            onAction={() => navigateTo('home')}
            icon={<LibraryIcon size={26} />}
          />
        )}

        {activeTab === 'upload' && (
          <EmptyState
            title="NO FILES ATTACHED."
            description="Drop photos, 4K videos, PDF guides, or ZIP packages into the dropzone."
            actionText="UPLOAD NOW"
            onAction={() => navigateTo('create_step1')}
            icon={<UploadIcon size={26} />}
          />
        )}
      </div>
    </div>
  );
};
