import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ShieldIcon, CheckIcon, AlertCircleIcon } from '../../assets/icons/Icons';

interface AccessGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productTitle: string;
  creatorName: string;
  isAgeRestricted?: boolean;
}

export const AccessGateModal: React.FC<AccessGateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productTitle,
  creatorName,
  isAgeRestricted = false
}) => {
  const [agreedAge, setAgreedAge] = useState(!isAgeRestricted);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const canProceed = agreedAge && agreedTerms;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ACCESS VERIFICATION">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: 'var(--bg-surface-subtle)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#111111',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldIcon size={20} />
          </div>

          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase' }}>
              DIRECT ACCESS COMPLIANCE
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Published directly by {creatorName}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          You are requesting access to private content: <strong>{productTitle}</strong>. Please confirm your eligibility before completing checkout.
        </p>

        {isAgeRestricted && (
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--text-primary)'
            }}
          >
            <input
              type="checkbox"
              checked={agreedAge}
              onChange={(e) => setAgreedAge(e.target.checked)}
              style={{ marginTop: 2, accentColor: '#111111' }}
            />
            <span>I confirm that I am at least 18 years of age or meet the legal age of digital majority in my jurisdiction.</span>
          </label>
        )}

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--text-primary)'
          }}
        >
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            style={{ marginTop: 2, accentColor: '#111111' }}
          />
          <span>I agree to the Unlockly Personal License Terms and acknowledge that redistribution without authorization is prohibited.</span>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <Button
            variant="primary"
            disabled={!canProceed}
            onClick={() => {
              onClose();
              onConfirm();
            }}
          >
            CONTINUE TO CHECKOUT →
          </Button>

          <Button variant="ghost" onClick={onClose}>
            CANCEL
          </Button>
        </div>
      </div>
    </Modal>
  );
};
