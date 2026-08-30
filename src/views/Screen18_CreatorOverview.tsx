import React from 'react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { StatsCard } from '../components/cards/StatsCard';
import { WalletIcon, LockIcon } from '../assets/icons/Icons';
import { EmptyState } from '../components/common/EmptyState';

export const Screen18_CreatorOverview: React.FC = () => {
  const { products, activities } = useProducts();
  const { user } = useAuth();
  const { navigateTo, openProductManage } = useNavigation();

  // Compute live aggregates
  const totalEarned = products.reduce((sum, p) => sum + (p.totalEarned || 0), 0);
  const totalSales = products.reduce((sum, p) => sum + (p.unlocksCount || 0), 0);
  const avgPurchase = totalSales > 0 ? totalEarned / totalSales : 0;

  return (
    <div className="app-content p-page">
      <div style={{ marginBottom: 20 }}>
        <span className="text-label">CREATOR ANALYTICS</span>
        <h1 className="text-headline" style={{ marginTop: 2 }}>
          EARNINGS OVERVIEW
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          Live breakdown of your digital sales and payouts.
        </p>
      </div>

      {/* Main Stats Widget */}
      <StatsCard
        totalEarned={totalEarned}
        totalSales={totalSales}
        avgPurchase={avgPurchase}
        currency={user?.currency || 'AED'}
      />

      {/* Payout Information Card */}
      <div
        className="surface-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          marginBottom: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111111'
            }}
          >
            <WalletIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase' }}>
              DIRECT IBAN PAYOUT
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
              {user?.payoutIban || 'AE07 0331 2345 6789 0123 456'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('profile')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: 12,
            fontWeight: 800,
            color: '#111111',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          SETTINGS →
        </button>
      </div>

      {/* Recent Activity Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}
          >
            RECENT ACTIVITY
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Real-time feed
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="surface-card" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase' }}>
              NO RECENT SALES ACTIVITY
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Unlock transactions will appear here in real time.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activities.map((act) => (
              <div
                key={act.id}
                onClick={() => openProductManage(act.productId)}
                className="surface-card surface-card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {act.buyerAvatar ? (
                    <img
                      src={act.buyerAvatar}
                      alt={act.buyerName || 'Buyer'}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#111111',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800
                      }}
                    >
                      {act.buyerName ? act.buyerName.slice(0, 2).toUpperCase() : 'UN'}
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
                      {act.buyerName || 'Verified Purchaser'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Unlocked <strong>{act.productTitle}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>
                    +{act.currency || 'AED'} {act.amount?.toFixed(2) || '25.00'}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {act.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
