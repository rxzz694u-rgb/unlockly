import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { ShieldIcon, CheckIcon } from '../../assets/icons/Icons';

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  productTitle: string;
  amountFormatted: string;
}

export const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  onComplete,
  productTitle,
  amountFormatted
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Connecting to secure payment gateway...',
    'Verifying payment authorization & biometric signature...',
    'Generating server-side signed access permission token...',
    'Finalizing transaction & unlocking media...'
  ];

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }

    const t1 = setTimeout(() => setStepIndex(1), 900);
    const t2 = setTimeout(() => setStepIndex(2), 1900);
    const t3 = setTimeout(() => setStepIndex(3), 2800);
    const t4 = setTimeout(() => {
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, onComplete]);

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '24px 8px',
          gap: 20
        }}
      >
        {/* Animated Pulse Ring */}
        <div
          style={{
            position: 'relative',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            className="pulse-animation"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(17, 17, 17, 0.08)',
              border: '2px solid rgba(17, 17, 17, 0.2)'
            }}
          />
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: '#111111',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(0,0,0,0.2)'
            }}
          >
            <ShieldIcon size={26} />
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}
          >
            PROCESSING PAYMENT...
          </h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {amountFormatted} • {productTitle}
          </div>
        </div>

        {/* Multi-step progress list */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            textAlign: 'left'
          }}
        >
          {steps.map((text, idx) => {
            const isDone = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 12.5,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isDone ? '#059669' : isCurrent ? '#111111' : '#9E9E98',
                  transition: 'color 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: isDone ? '#059669' : isCurrent ? '#111111' : '#E4E4E0',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 800,
                    flexShrink: 0
                  }}
                >
                  {isDone ? <CheckIcon size={12} strokeWidth={3} /> : idx + 1}
                </div>
                <span>{text}</span>
              </div>
            );
          })}
        </div>

        <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
          Please do not close this window while verifying.
        </span>
      </div>
    </Modal>
  );
};
