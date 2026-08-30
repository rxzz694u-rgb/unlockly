import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { LockedPreview } from '../components/media/LockedPreview';
import { Button } from '../components/common/Button';
import { AccessGateModal } from '../components/modals/AccessGateModal';
import { CheckoutModal } from '../components/modals/CheckoutModal';
import { PaymentProcessingModal } from '../components/modals/PaymentProcessingModal';
import { ReportContentModal } from '../components/modals/ReportContentModal';
import { ShareSheet } from '../components/modals/ShareSheet';
import { LockIcon, UnlockIcon, ShieldIcon, ShareIcon, ArrowRightIcon } from '../assets/icons/Icons';
import { PaymentProvider } from '../types';
import { paymentService } from '../services/paymentService';

export const Screen10_PublicContent: React.FC = () => {
  const { products, hasAccess, recordPurchase } = useProducts();
  const { activeProductId, navigateTo, openUnlockedViewer } = useNavigation();
  const { user } = useAuth();

  // Modals state
  const [isAccessGateOpen, setIsAccessGateOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessingOpen, setIsProcessingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const product = products.find((p) => p.id === activeProductId);
  const isUnlocked = product ? hasAccess(product.id) : false;
  const shareUrl = product ? `${window.location.origin}/p/${product.id}` : `${window.location.origin}/`;

  const handleStartUnlock = () => {
    if (!product) return;
    if (isUnlocked) {
      openUnlockedViewer(product.id);
      return;
    }
    if (product.requiresAgeGate) {
      setIsAccessGateOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handlePaymentInitiated = async (provider: PaymentProvider, email: string, cardData?: any) => {
    if (!product) return;
    setIsCheckoutOpen(false);
    setIsProcessingOpen(true);

    const result = await paymentService.processPayment(
      product,
      { name: user?.name || email.split('@')[0], email, id: user?.id },
      provider,
      cardData
    );

    if (result.success && result.purchase && result.permission) {
      recordPurchase(result.purchase, result.permission);
    }
  };

  const handleProcessingComplete = () => {
    setIsProcessingOpen(false);
    if (product) {
      navigateTo('payment_success', { productId: product.id });
    }
  };

  if (!product) {
    return (
      <div className="app-content no-bottom-nav p-page" style={{ justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
            <LockIcon size={32} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            LINK NOT FOUND
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            This private link does not exist or has been removed by the creator.
          </p>
          <Button variant="primary" onClick={() => navigateTo('home')}>
            GO TO HOME
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content no-bottom-nav">
      <div className="p-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Creator Identity Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={product.creatorAvatar}
              alt={product.creatorName}
              style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14.5, fontWeight: 800, textTransform: 'uppercase' }}>
                  {product.creatorName}
                </span>
                <span style={{ color: '#059669', display: 'flex', alignItems: 'center' }}>
                  <ShieldIcon size={14} />
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                @{product.creatorHandle}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ShareIcon size={17} />
          </button>
        </div>

        {/* Section Tag */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isUnlocked ? '#059669' : '#777777', marginBottom: 2 }}>
            {isUnlocked ? <UnlockIcon size={13} strokeWidth={2.4} /> : <LockIcon size={13} strokeWidth={2.4} />}
            <span className="text-label" style={{ color: 'inherit', margin: 0 }}>
              {isUnlocked ? 'UNLOCKED ARCHIVE' : 'PRIVATE EXCLUSIVE DROP'}
            </span>
          </div>
          <h1 className="text-headline" style={{ marginTop: 2 }}>
            {product.title}
          </h1>
        </div>

        {/* Media Preview (Locked or Unlocked banner) */}
        {isUnlocked ? (
          <div
            onClick={() => openUnlockedViewer(product.id)}
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              aspectRatio: '16 / 10',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-elevated)'
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
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                gap: 8
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UnlockIcon size={24} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TAP TO OPEN FULL VAULT
              </span>
            </div>
          </div>
        ) : (
          <LockedPreview
            coverUrl={product.coverImage}
            previewBlurUrl={product.previewBlurUrl}
            title={product.title}
            creatorName={product.creatorName}
            priceFormatted={`${product.currency} ${product.price.toFixed(2)}`}
            accessType={product.accessType}
            fileCount={product.files.length}
            onUnlockClick={handleStartUnlock}
          />
        )}

        {/* Content Description */}
        <div
          className="surface-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            WHAT YOU RECEIVE UPON UNLOCK
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {product.description}
          </p>

          <div className="divider" style={{ margin: '4px 0' }} />

          {/* Included Files Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                TOTAL FILES
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>
                {product.files.length} High-Res Assets
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                DELIVERY
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>
                Instant + ZIP Download
              </div>
            </div>
          </div>
        </div>

        {/* Trust, Security & Report Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <ShieldIcon size={15} />
            <span>Encrypted Delivery</span>
          </div>

          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 12,
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Report content
          </button>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky-bottom-bar">
        {isUnlocked ? (
          <Button
            variant="primary"
            onClick={() => openUnlockedViewer(product.id)}
            leftIcon={<UnlockIcon size={18} />}
          >
            VIEW UNLOCKED CONTENT →
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleStartUnlock}
            rightIcon={<ArrowRightIcon size={18} />}
          >
            UNLOCK ACCESS • {product.currency} {product.price.toFixed(2)}
          </Button>
        )}
      </div>

      {/* Access Gate Modal */}
      <AccessGateModal
        isOpen={isAccessGateOpen}
        onClose={() => setIsAccessGateOpen(false)}
        onConfirm={() => setIsCheckoutOpen(true)}
        productTitle={product.title}
        creatorName={product.creatorName}
        isAgeRestricted={product.requiresAgeGate}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
        onInitiatePayment={handlePaymentInitiated}
      />

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        isOpen={isProcessingOpen}
        onComplete={handleProcessingComplete}
        productTitle={product.title}
        amountFormatted={`${product.currency} ${product.price.toFixed(2)}`}
      />

      {/* Share Sheet */}
      <ShareSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={shareUrl}
        title={product.title}
      />

      {/* Report Modal */}
      <ReportContentModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        productTitle={product.title}
      />
    </div>
  );
};
