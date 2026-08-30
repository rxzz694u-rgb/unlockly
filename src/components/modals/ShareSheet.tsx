import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Button } from '../common/Button';
import { CopyIcon, ShareIcon, QrCodeIcon, CheckIcon, MessageCircleIcon, SendIcon, TwitterIcon } from '../../assets/icons/Icons';
import { useToast } from '../../context/ToastContext';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
  onOpenQrCode?: () => void;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({
  isOpen,
  onClose,
  shareUrl,
  title,
  onOpenQrCode
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied to clipboard', shareUrl, 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Copied link', shareUrl);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Unlockly — ${title}`,
          text: `Unlock exclusive content: ${title}`,
          url: shareUrl
        });
        onClose();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Unlock exclusive private content on Unlockly: ${title}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`Unlock exclusive private content: ${title}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Unlock exclusive private drop: ${title} via @unlockly`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="SHARE PRIVATE LINK">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* URL Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
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

        {/* Social Share Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="surface-card surface-card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 8px',
              gap: 8,
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ color: '#111111' }}>
              <MessageCircleIcon size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={shareTelegram}
            className="surface-card surface-card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 8px',
              gap: 8,
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ color: '#111111' }}>
              <SendIcon size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Telegram</span>
          </button>

          <button
            type="button"
            onClick={shareTwitter}
            className="surface-card surface-card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 8px',
              gap: 8,
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ color: '#111111' }}>
              <TwitterIcon size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>X (Twitter)</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
          <Button
            variant="primary"
            onClick={handleNativeShare}
            leftIcon={<ShareIcon size={18} />}
          >
            SYSTEM SHARE DIALOG
          </Button>

          {onOpenQrCode && (
            <Button
              variant="secondary"
              onClick={() => {
                onClose();
                onOpenQrCode();
              }}
              leftIcon={<QrCodeIcon size={18} />}
            >
              GENERATE QR CODE
            </Button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
