import React from 'react';
import { Product } from '../../types';
import { ChevronRightIcon, LockIcon } from '../../assets/icons/Icons';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const coverUrl = product.coverImage || product.files[0]?.previewPath || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80';

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
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        {product.accessType === 'blurred' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <LockIcon size={14} />
          </div>
        )}
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
          {product.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {product.currency} {product.price.toFixed(2)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
            •
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {product.unlocksCount} {product.unlocksCount === 1 ? 'UNLOCK' : 'UNLOCKS'}
          </span>
        </div>
      </div>

      {/* Status Pill & Chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {product.status === 'paused' ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              textTransform: 'uppercase'
            }}
          >
            PAUSED
          </span>
        ) : null}
        
        <ChevronRightIcon size={18} className="text-secondary" />
      </div>
    </div>
  );
};
