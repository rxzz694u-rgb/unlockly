import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertCircleIcon, CheckIcon } from '../../assets/icons/Icons';
import { useToast } from '../../context/ToastContext';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
}

export const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  productTitle
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('copyright');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      showToast('Report submitted for trust & safety review', undefined, 'success');
      setSubmitted(false);
      setDetails('');
      onClose();
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="REPORT CONTENT">
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              backgroundColor: '#111111',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}
          >
            <CheckIcon size={28} />
          </div>
          <h4 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase' }}>REPORT RECEIVED</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Our moderation team will review this link within 2 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Report an issue with <strong>{productTitle}</strong>:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'copyright', label: 'Copyright or IP Infringement (DMCA)' },
              { id: 'prohibited', label: 'Prohibited or illegal digital content' },
              { id: 'misleading', label: 'Misleading description or broken file' },
              { id: 'harassment', label: 'Privacy violation or non-consensual media' }
            ].map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: reason === opt.id ? 'var(--bg-surface-subtle)' : '#FFFFFF',
                  border: '1px solid var(--border-default)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: reason === opt.id ? 700 : 500
                }}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={opt.id}
                  checked={reason === opt.id}
                  onChange={() => setReason(opt.id)}
                  style={{ accentColor: '#111111' }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)..."
            className="textarea-field"
            style={{ minHeight: 70 }}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button variant="danger" type="submit">
              SUBMIT REPORT
            </Button>
            <Button variant="secondary" type="button" onClick={onClose}>
              CANCEL
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
