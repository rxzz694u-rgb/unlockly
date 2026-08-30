import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Product, PaymentProvider } from '../../types';
import { AppleIcon, CreditCardIcon, ShieldIcon, CheckIcon } from '../../assets/icons/Icons';
import { useAuth } from '../../context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onInitiatePayment: (provider: PaymentProvider, email: string, cardData?: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  onInitiatePayment
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('apple_pay');

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');

  const handlePay = () => {
    onInitiatePayment(
      selectedProvider,
      email,
      selectedProvider === 'card' ? { cardNumber, expDate, cvc, cardHolder } : undefined
    );
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="SECURE CHECKOUT">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Item Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px'
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            CONTENT
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: 2 }}>
            {product.title}
          </div>

          <div className="divider" style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL DUE</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {product.currency} {product.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Email Address */}
        <Input
          label="DELIVERY EMAIL"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@domain.com"
          helperText="Instant access & receipt will be delivered here."
        />

        {/* Payment Methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="text-label">PAYMENT METHOD</label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Apple Pay Button */}
            <button
              type="button"
              onClick={() => setSelectedProvider('apple_pay')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedProvider === 'apple_pay' ? '#111111' : '#FFFFFF',
                color: selectedProvider === 'apple_pay' ? '#FFFFFF' : '#111111',
                border: selectedProvider === 'apple_pay' ? '1.5px solid #111111' : '1px solid var(--border-default)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                transition: 'all 0.15s ease'
              }}
            >
              <AppleIcon size={18} />
              <span>Apple Pay</span>
            </button>

            {/* Credit Card Button */}
            <button
              type="button"
              onClick={() => setSelectedProvider('card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedProvider === 'card' ? '#111111' : '#FFFFFF',
                color: selectedProvider === 'card' ? '#FFFFFF' : '#111111',
                border: selectedProvider === 'card' ? '1.5px solid #111111' : '1px solid var(--border-default)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                transition: 'all 0.15s ease'
              }}
            >
              <CreditCardIcon size={18} />
              <span>Credit Card</span>
            </button>
          </div>
        </div>

        {/* Live Card inputs if Card selected */}
        {selectedProvider === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.2s ease' }}>
            <Input
              label="CARD NUMBER"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="0000 0000 0000 0000"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Input
                label="EXPIRY"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                placeholder="MM/YY"
              />
              <Input
                label="CVC / CVI"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
              />
            </div>
          </div>
        )}

        {/* Security Reassurance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
          <ShieldIcon size={16} />
          <span>256-Bit Encrypted Server-Side Verified Checkout</span>
        </div>

        {/* Primary CTA */}
        <Button
          variant="primary"
          onClick={handlePay}
          disabled={!email || !email.includes('@')}
        >
          {selectedProvider === 'apple_pay' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>PAY WITH</span> <AppleIcon size={16} /> <span>{product.currency} {product.price.toFixed(2)}</span>
            </span>
          ) : (
            `PAY ${product.currency} ${product.price.toFixed(2)} →`
          )}
        </Button>
      </div>
    </BottomSheet>
  );
};
