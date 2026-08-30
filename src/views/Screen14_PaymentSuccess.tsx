import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { downloadService } from '../services/downloadService';
import { SuccessState } from '../components/common/SuccessState';
import { Button } from '../components/common/Button';
import { DownloadIcon, ArrowRightIcon, LibraryIcon, CheckIcon } from '../assets/icons/Icons';

export const Screen14_PaymentSuccess: React.FC = () => {
  const { products } = useProducts();
  const { activeProductId, navigateTo, openUnlockedViewer } = useNavigation();
  const { showToast } = useToast();
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const product = products.find((p) => p.id === activeProductId);

  const handleDownloadAll = async () => {
    if (!product) return;
    setIsZipping(true);
    showToast('Preparing ZIP archive download...', undefined, 'info');
    await downloadService.downloadAllAsZip(product, (pct) => setZipProgress(pct));
    setIsZipping(false);
    showToast('Download started!', `${product.title}.zip`, 'success');
  };

  if (!product) {
    return (
      <div className="app-content no-bottom-nav p-page" style={{ justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            ACCESS GRANTED
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Your transaction was completed. Access has been registered to your account.
          </p>
          <Button variant="primary" onClick={() => navigateTo('library')}>
            VIEW IN LIBRARY
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content no-bottom-nav p-page" style={{ justifyContent: 'space-between' }}>
      <div>
        <SuccessState
          title="ACCESS GRANTED."
          subtitle="Your purchase was successful. Full unrestricted access has been granted."
          triggerConfetti={true}
        >
          {/* Content Summary Card */}
          <div
            className="surface-card"
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              marginBottom: 16
            }}
          >
            <img
              src={product.coverImage || product.files[0]?.previewPath}
              alt={product.title}
              style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                UNLOCKED ITEM
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.title}
              </div>
              <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckIcon size={13} strokeWidth={2.5} />
                <span>Added to your permanent library</span>
              </div>
            </div>
          </div>
        </SuccessState>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <Button
          variant="primary"
          onClick={() => openUnlockedViewer(product.id)}
          rightIcon={<ArrowRightIcon size={18} />}
        >
          VIEW CONTENT NOW
        </Button>

        <Button
          variant="secondary"
          isLoading={isZipping}
          onClick={handleDownloadAll}
          leftIcon={<DownloadIcon size={18} />}
        >
          {isZipping ? `PACKAGING ZIP (${zipProgress}%)...` : 'DOWNLOAD ALL AS ZIP'}
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigateTo('library')}
          leftIcon={<LibraryIcon size={18} />}
        >
          RETURN TO LIBRARY
        </Button>
      </div>
    </div>
  );
};
