import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DownloadIcon } from '../../assets/icons/Icons';
import { useToast } from '../../context/ToastContext';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#111111',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [isOpen, url]);

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `Unlockly_QR_${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    showToast('QR Code saved to gallery', undefined, 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SCAN TO UNLOCK">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Scan with your phone camera to view and unlock: <br />
          <strong>{title}</strong>
        </p>

        {/* QR Code Canvas */}
        <div
          style={{
            padding: 14,
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <canvas ref={canvasRef} style={{ width: 220, height: 220 }} />
        </div>

        <Button
          variant="primary"
          onClick={handleDownloadQR}
          leftIcon={<DownloadIcon size={18} />}
        >
          SAVE QR IMAGE
        </Button>
      </div>
    </Modal>
  );
};
