import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { ShieldIcon, ArrowRightIcon } from '../assets/icons/Icons';

export const Screen8_Publish: React.FC = () => {
  const { draft, publishDraft } = useProducts();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const published = await publishDraft();
      setIsPublishing(false);
      showToast('Private link generated successfully!', published.title, 'success');
      navigateTo('publish_success', { productId: published.id, publishedProduct: published });
    } catch (err: any) {
      console.error('Publish error:', err);
      setIsPublishing(false);
      showToast('Failed to publish link', err?.message || 'Please try again', 'error');
    }
  };

  const coverUrl = draft.coverImage || draft.files[0]?.blobDataUrl || draft.files[0]?.previewPath || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';

  return (
    <div className="app-content no-bottom-nav">
      <div className="p-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <span className="text-label">FINAL STEP 5 OF 5</span>
          <h1 className="text-headline" style={{ marginTop: 2 }}>
            READY TO DROP.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Review your drop details before generating your live secure link.
          </p>
        </div>

        {/* Product Card Summary */}
        <div
          className="surface-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          {/* Cover Preview */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              backgroundColor: '#1E1E1E'
            }}
          >
            <img
              src={coverUrl}
              alt={draft.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: '#111111',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}
            >
              {draft.files.length} {draft.files.length === 1 ? 'FILE' : 'FILES'}
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              {draft.title}
            </div>

            {draft.description && (
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {draft.description}
              </p>
            )}

            <div className="divider" style={{ margin: '6px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  UNLOCK PRICE
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#111111', marginTop: 2 }}>
                  {draft.currency} {Number(draft.price).toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  ACCESS TYPE
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginTop: 2 }}>
                  {draft.accessType}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Message Box */}
        <div
          style={{
            backgroundColor: '#111111',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <ShieldIcon size={22} style={{ color: '#10B981', flexShrink: 0 }} />
          <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>
            Your protected content remains encrypted and private until access is authorized by verified payment.
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="sticky-bottom-bar">
        <Button
          variant="primary"
          isLoading={isPublishing}
          onClick={handlePublish}
          rightIcon={<ArrowRightIcon size={18} />}
        >
          PUBLISH PRIVATE LINK
        </Button>
      </div>
    </div>
  );
};
