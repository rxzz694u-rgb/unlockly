import React from 'react';
import { LockIcon, EyeIcon } from '../../assets/icons/Icons';
import { AccessType } from '../../types';

interface LockedPreviewProps {
  coverUrl?: string;
  previewBlurUrl?: string;
  title: string;
  creatorName: string;
  priceFormatted: string;
  accessType?: AccessType;
  fileCount?: number;
  onUnlockClick?: () => void;
}

export const LockedPreview: React.FC<LockedPreviewProps> = ({
  coverUrl,
  previewBlurUrl,
  title,
  creatorName,
  priceFormatted,
  accessType = 'blurred',
  fileCount = 1,
  onUnlockClick
}) => {
  const displayImage = previewBlurUrl || coverUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="locked-media-container" onClick={onUnlockClick} style={{ cursor: onUnlockClick ? 'pointer' : 'default' }}>
      {/* Blurred image layer */}
      <img
        src={displayImage}
        alt={title}
        className="locked-media-blur"
        loading="lazy"
      />

      {/* Lock Overlay */}
      <div className="locked-media-overlay">
        <div className="locked-badge">
          <LockIcon size={14} strokeWidth={2.4} />
          <span>LOCKED CONTENT</span>
        </div>

        <div
          style={{
            marginTop: 'auto',
            width: '100%',
            backgroundColor: 'rgba(17, 17, 17, 0.75)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#A3A3A3', textTransform: 'uppercase' }}>
              {fileCount} {fileCount === 1 ? 'FILE' : 'EXCLUSIVE FILES'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginTop: 2 }}>
              {priceFormatted}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: '#111111',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}
          >
            UNLOCK →
          </div>
        </div>
      </div>
    </div>
  );
};
