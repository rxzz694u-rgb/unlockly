import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ShareSheet } from '../components/modals/ShareSheet';
import { QrCodeModal } from '../components/modals/QrCodeModal';
import { CopyIcon, ShareIcon, EditIcon, TrashIcon, PauseIcon, PlayIcon, ExternalLinkIcon, CheckIcon, QrCodeIcon } from '../assets/icons/Icons';

export const Screen17_ProductManagement: React.FC = () => {
  const { products, updateProduct, deleteProduct } = useProducts();
  const { activeProductId, navigateTo, openPublicProduct, openUnlockedViewer } = useNavigation();
  const { showToast } = useToast();

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const product = products.find((p) => p.id === activeProductId);

  // Edit fields state
  const [editTitle, setEditTitle] = useState(product?.title || '');
  const [editPrice, setEditPrice] = useState(product?.price || 0);

  if (!product) {
    return (
      <div className="app-content no-bottom-nav p-page" style={{ justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            PRODUCT NOT FOUND
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            This item does not exist or has been deleted.
          </p>
          <Button variant="primary" onClick={() => navigateTo('home')}>
            RETURN TO HOME
          </Button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/#/p/${product.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied to clipboard', undefined, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Copied link', shareUrl);
    }
  };

  const handleTogglePause = () => {
    const nextStatus = product.status === 'paused' ? 'active' : 'paused';
    updateProduct(product.id, { status: nextStatus });
    showToast(nextStatus === 'paused' ? 'Link paused from public checkout' : 'Link reactivated', undefined, 'info');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduct(product.id, { title: editTitle, price: Number(editPrice) });
    setIsEditOpen(false);
    showToast('Product details updated', undefined, 'success');
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    setIsDeleteOpen(false);
    showToast('Link deleted', undefined, 'info');
    navigateTo('home');
  };

  return (
    <div className="app-content no-bottom-nav p-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Cover Image & Status Badge */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#1E1E1E',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <img
          src={product.coverImage || product.files[0]?.previewPath}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: product.status === 'active' ? '#059669' : '#4B5563',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 10.5,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          {product.status === 'active' ? '● LIVE LINK' : '❚❚ PAUSED'}
        </div>

        <button
          type="button"
          onClick={() => openPublicProduct(product.id)}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(17, 17, 17, 0.85)',
            color: '#FFFFFF',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 11.5,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backdropFilter: 'blur(8px)'
          }}
        >
          <span>PREVIEW BUYER VIEW</span>
          <ExternalLinkIcon size={12} />
        </button>
      </div>

      {/* Title & Price Header */}
      <div>
        <span className="text-label">LINK CONTROL CENTER</span>
        <h1 className="text-headline" style={{ marginTop: 2 }}>
          {product.title}
        </h1>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
          {product.currency} {product.price.toFixed(2)}
        </div>
      </div>

      {/* Analytics Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12
        }}
      >
        <div className="surface-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            TOTAL UNLOCKS
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {product.unlocksCount}
          </div>
        </div>

        <div className="surface-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            REVENUE EARNED
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 4 }}>
            {product.currency} {product.totalEarned.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quick Share Link Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {shareUrl}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            backgroundColor: copied ? '#059669' : '#111111',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
          <span>{copied ? 'COPIED' : 'COPY'}</span>
        </button>
      </div>

      {/* Primary Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Button
          variant="primary"
          onClick={() => setIsShareOpen(true)}
          leftIcon={<ShareIcon size={16} />}
        >
          SHARE LINK
        </Button>

        <Button
          variant="secondary"
          onClick={() => setIsQrOpen(true)}
          leftIcon={<QrCodeIcon size={16} />}
        >
          QR CODE
        </Button>
      </div>

      {/* Management Actions List */}
      <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          onClick={() => {
            setEditTitle(product.title);
            setEditPrice(product.price);
            setIsEditOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <EditIcon size={18} />
            <span style={{ fontSize: 13.5, fontWeight: 700, textTransform: 'uppercase' }}>Edit Title & Price</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
        </div>

        <div
          onClick={handleTogglePause}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {product.status === 'paused' ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
            <span style={{ fontSize: 13.5, fontWeight: 700, textTransform: 'uppercase' }}>
              {product.status === 'paused' ? 'Reactivate Link' : 'Pause Link'}
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
            {product.status === 'paused' ? 'RESUME' : 'PAUSE'}
          </span>
        </div>

        <div
          onClick={() => openUnlockedViewer(product.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ExternalLinkIcon size={18} />
            <span style={{ fontSize: 13.5, fontWeight: 700, textTransform: 'uppercase' }}>Open Vault / Files</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>→</span>
        </div>
      </div>

      {/* Destructive Action Section */}
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            border: '1px solid var(--accent-danger-border)',
            color: 'var(--accent-danger)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            textTransform: 'uppercase'
          }}
        >
          <TrashIcon size={16} />
          <span>DELETE THIS LINK</span>
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="EDIT LINK">
        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="TITLE"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />
          <Input
            label={`PRICE (${product.currency})`}
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
            required
          />
          <Button variant="primary" type="submit">
            SAVE CHANGES
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="DELETE PRIVATE LINK">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Are you sure you want to delete <strong>{product.title}</strong>? Existing buyers will retain access in their library, but new purchases will be disabled.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="danger" onClick={handleDelete}>
              CONFIRM DELETE
            </Button>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Sheet */}
      <ShareSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={shareUrl}
        title={product.title}
        onOpenQrCode={() => setIsQrOpen(true)}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={shareUrl}
        title={product.title}
      />
    </div>
  );
};
