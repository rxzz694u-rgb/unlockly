import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { PriceInput } from '../components/common/PriceInput';
import { CurrencySelector } from '../components/common/CurrencySelector';
import { Button } from '../components/common/Button';
import { ArrowRightIcon } from '../assets/icons/Icons';

export const Screen7_Pricing: React.FC = () => {
  const { draft, updateDraft } = useProducts();
  const { navigateTo } = useNavigation();
  const [isFree, setIsFree] = useState(draft.price === 0);

  const price = isFree ? 0 : Number(draft.price) || 0;
  const platformFee = Number((price * 0.05).toFixed(2));
  const creatorPayout = Number((price - platformFee).toFixed(2));

  const handleToggleFree = (free: boolean) => {
    setIsFree(free);
    if (free) {
      updateDraft({ price: 0 });
    } else if (draft.price === 0) {
      updateDraft({ price: 25.00 });
    }
  };

  return (
    <div className="app-content no-bottom-nav">
      <div className="p-page" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <span className="text-label">STEP 4 OF 5</span>
          <h1 className="text-headline" style={{ marginTop: 2 }}>
            HOW MUCH?
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Set what buyers pay to unlock your full media archive.
          </p>
        </div>

        {/* Free vs Paid Pill Toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-surface-subtle)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)'
          }}
        >
          <button
            type="button"
            onClick={() => handleToggleFree(false)}
            style={{
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: !isFree ? '#111111' : 'transparent',
              color: !isFree ? '#FFFFFF' : '#777777',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            PAID ACCESS
          </button>

          <button
            type="button"
            onClick={() => handleToggleFree(true)}
            style={{
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: isFree ? '#111111' : 'transparent',
              color: isFree ? '#FFFFFF' : '#777777',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            FREE ACCESS
          </button>
        </div>

        {/* Large Price Input */}
        <div>
          <label className="text-label" style={{ marginBottom: 8, display: 'block' }}>
            UNLOCK PRICE
          </label>
          <PriceInput
            value={draft.price}
            currency={draft.currency}
            onChange={(val) => updateDraft({ price: val })}
            isFree={isFree}
          />
        </div>

        {/* Currency Picker */}
        <div>
          <label className="text-label" style={{ marginBottom: 8, display: 'block' }}>
            SELECT CURRENCY
          </label>
          <CurrencySelector
            value={draft.currency}
            onChange={(c) => updateDraft({ currency: c })}
          />
        </div>

        {/* Payout & Fee Transparency Breakdown */}
        {!isFree && (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, textTransform: 'uppercase', color: '#111111' }}>
                YOU RECEIVE (95%)
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>
                {draft.currency} {creatorPayout.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                PLATFORM FEE (5%)
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {draft.currency} {platformFee.toFixed(2)}
              </span>
            </div>

            <div className="divider" style={{ margin: '4px 0' }} />

            <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
              Instant direct payout to your linked bank IBAN upon each verified unlock.
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action */}
      <div className="sticky-bottom-bar">
        <Button
          variant="primary"
          onClick={() => navigateTo('create_step5')}
          rightIcon={<ArrowRightIcon size={18} />}
        >
          REVIEW & PUBLISH
        </Button>
      </div>
    </div>
  );
};
