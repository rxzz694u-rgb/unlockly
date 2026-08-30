import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { SuccessState } from '../components/common/SuccessState';
import { Button } from '../components/common/Button';
import { ShareSheet } from '../components/modals/ShareSheet';
import { QrCodeModal } from '../components/modals/QrCodeModal';
import { CopyIcon, ShareIcon, ExternalLinkIcon, QrCodeIcon, CheckIcon } from '../assets/icons/Icons';

export const Screen9_SuccessShare: React.FC = () => {
  const { products } = useProducts();
  const { publishedProduct, activeProductId, navigateTo, openPublicProduct } = useNavigation();
  const { showToast } = useToast();

  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const product = publishedProduct || products.find((p) => p.id === activeProductId) || products[0];
  const slug = product?.customShareSlug || product?.id || 'exclusive';
  const shareUrl = product ? `${window.location.origin}/#/u/${slug}` : `${window.location.origin}/`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied to clipboard', undefined, 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Link ready', shareUrl);
    }
  };

  return (
    <div className="app-content no-bottom-nav p-page" style={{ justifyContent: 'space-between' }}>
      <div>
        <SuccessState
          title="PUBLISHED."
          subtitle="Your private unlock link is live and ready to share across your channels."
          triggerConfetti={true}
        >
          {/* URL Container */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              boxShadow: 'var(--shadow-card)',
              marginBottom: 16
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
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
                gap: 4,
                flexShrink: 0
              }}
            >
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>

          {/* Direct Share & QR Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
            <Button
              variant="secondary"
              onClick={() => setIsShareSheetOpen(true)}
              leftIcon={<ShareIcon size={16} />}
            >
              SHARE LINK
            </Button>

            <Button
              variant="secondary"
              onClick={() => setIsQrModalOpen(true)}
              leftIcon={<QrCodeIcon size={16} />}
            >
              QR CODE
            </Button>
          </div>
        </SuccessState>
      </div>

      {/* Footer Nav CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <Button
          variant="primary"
          onClick={() => openPublicProduct(product.id)}
          rightIcon={<ExternalLinkIcon size={16} />}
        >
          VIEW PUBLIC BUYER PAGE
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigateTo('home')}
        >
          RETURN TO HOME HUB
        </Button>
      </div>

      {/* Share Sheet */}
      <ShareSheet
        isOpen={isShareSheetOpen}
        onClose={() => setIsShareSheetOpen(false)}
        shareUrl={shareUrl}
        title={product.title}
        onOpenQrCode={() => setIsQrModalOpen(true)}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url={shareUrl}
        title={product.title}
      />
    </div>
  );
};
