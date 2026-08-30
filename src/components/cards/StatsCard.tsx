import React from 'react';
import { WalletIcon, ArrowRightIcon } from '../../assets/icons/Icons';

interface StatsCardProps {
  totalEarned: number;
  totalSales: number;
  avgPurchase: number;
  currency?: string;
  onViewDetails?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  totalEarned,
  totalSales,
  avgPurchase,
  currency = 'AED',
  onViewDetails
}) => {
  return (
    <div
      className="surface-card"
      style={{
        backgroundColor: '#111111',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 'var(--radius-xl)',
        padding: '22px 20px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
        marginBottom: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#A3A3A3',
            textTransform: 'uppercase'
          }}
        >
          TOTAL EARNED
        </span>
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: '#10B981'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
          LIVE
        </div>
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#FFFFFF',
          lineHeight: 1.1
        }}
      >
        {currency} {totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Mini Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#A3A3A3', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            TOTAL SALES
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginTop: 3 }}>
            {totalSales}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#A3A3A3', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            AVG PURCHASE
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginTop: 3 }}>
            {currency} {avgPurchase.toFixed(2)}
          </div>
        </div>
      </div>

      {onViewDetails && (
        <div
          onClick={onViewDetails}
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#D4D4D0',
            cursor: 'pointer',
            paddingTop: 12,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <span>VIEW DETAILED ANALYTICS</span>
          <ArrowRightIcon size={14} />
        </div>
      )}
    </div>
  );
};
