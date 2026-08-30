import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { StatsCard } from '../components/cards/StatsCard';
import { ProductCard } from '../components/cards/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { PlusIcon, LockIcon } from '../assets/icons/Icons';

export const Screen3_Home: React.FC = () => {
  const { user } = useAuth();
  const { products } = useProducts();
  const { navigateTo, openProductManage } = useNavigation();

  // Filter products for this creator
  const creatorProducts = products.filter((p) => p.creatorId === user?.id || user?.role === 'creator');

  // Compute stats from real products
  const totalEarned = creatorProducts.reduce((sum, p) => sum + (p.totalEarned || 0), 0);
  const totalSales = creatorProducts.reduce((sum, p) => sum + (p.unlocksCount || 0), 0);
  const avgPurchase = totalSales > 0 ? totalEarned / totalSales : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="app-content p-page">
      {/* Greeting Header */}
      <div style={{ marginBottom: 20 }}>
        <span className="text-label">CREATOR HUB</span>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginTop: 2
          }}
        >
          {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
      </div>

      {/* Total Earned Stats Card */}
      <StatsCard
        totalEarned={totalEarned}
        totalSales={totalSales}
        avgPurchase={avgPurchase}
        currency={user?.currency || 'AED'}
        onViewDetails={() => navigateTo('creator_overview')}
      />

      {/* Your Content Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}
          >
            YOUR CONTENT
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {creatorProducts.length} {creatorProducts.length === 1 ? 'active link' : 'active links'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('create_step1')}
          style={{
            backgroundColor: '#111111',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}
        >
          <PlusIcon size={14} strokeWidth={2.5} />
          <span>CREATE NEW</span>
        </button>
      </div>

      {/* Products List */}
      {creatorProducts.length === 0 ? (
        <EmptyState
          title="NOTHING HERE YET."
          description="Create your first private link and start sharing."
          actionText="CREATE CONTENT"
          onAction={() => navigateTo('create_step1')}
          icon={<LockIcon size={26} />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {creatorProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => openProductManage(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
