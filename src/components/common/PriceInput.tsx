import React from 'react';
import { CurrencyCode } from '../../types';

interface PriceInputProps {
  value: number;
  currency: CurrencyCode;
  onChange: (price: number) => void;
  isFree?: boolean;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  currency,
  onChange,
  isFree = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(isNaN(val) ? 0 : Math.max(0, val));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 10,
        padding: '24px 16px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <span
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--text-secondary)',
          letterSpacing: '-0.02em'
        }}
      >
        {currency}
      </span>
      <input
        type="number"
        step="1"
        min="0"
        disabled={isFree}
        value={isFree ? 0 : value || ''}
        onChange={handleChange}
        placeholder="0"
        style={{
          width: '180px',
          fontSize: 48,
          fontWeight: 800,
          color: 'var(--text-primary)',
          textAlign: 'left',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          letterSpacing: '-0.04em'
        }}
      />
    </div>
  );
};
