import React, { useEffect } from 'react';
import { CloseIcon } from '../../assets/icons/Icons';
import { IconButton } from './IconButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal-backdrop ${isOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog">
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              {title}
            </h3>
            <IconButton variant="subtle" size={32} onClick={onClose}>
              <CloseIcon size={18} />
            </IconButton>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
