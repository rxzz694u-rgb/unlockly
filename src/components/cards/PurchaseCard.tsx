import React from 'react';
import { Purchase, Product } from '../../types';
import { ChevronRightIcon, UnlockIcon } from '../../assets/icons/Icons';

interface PurchaseCardProps {
  purchase: Purchase;
  product?: Product;
  onClick: () => void;
}

export const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase, product, onClick }) => {
  const coverUrl = product?.coverImage || product?.files[0]?.previewPath || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80';

  const formattedDate = new Date(purchase.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }).toUpperCase();

  return (
    <div
      onClick={onClick}
      className="surface-card surface-card-interactive"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        marginBottom: 10
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#1E1E1E',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        <img
          src={coverUrl}
          alt={purchase.productTitle}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: '#111111',
            color: '#10B981',
            width: 18,
            height: 18,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <UnlockIcon size={10} strokeWidth={2.5} />
        </div>
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14.5,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {purchase.productTitle}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            PURCHASED {formattedDate}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>•</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
            UNLOCKED
          </span>
        </div>
      </div>

      {/* Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <ChevronRightIcon size={18} className="text-secondary" />
      </div>
    </div>
  );
};
