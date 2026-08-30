import React from 'react';
import { CurrencyCode } from '../../types';

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}

const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal' }
];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {CURRENCIES.map((c) => {
        const isSelected = c.code === value;
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => onChange(c.code)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: isSelected ? '1.5px solid #111111' : '1px solid var(--border-default)',
              backgroundColor: isSelected ? '#111111' : '#FFFFFF',
              color: isSelected ? '#FFFFFF' : '#111111',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {c.code}
          </button>
        );
      })}
    </div>
  );
};
