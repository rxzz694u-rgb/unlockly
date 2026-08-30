import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { supabaseService, isSupabaseConfigured } from '../services/supabase';
import { MediaLink, Product } from '../types';
import { Button } from '../components/common/Button';
import {
  LockIcon,
  UnlockIcon,
  DownloadIcon,
  GoogleIcon,
  PhotoIcon,
  VideoIcon,
  FileIcon,
  ZipIcon,
  ArrowRightIcon,
  CheckIcon
} from '../assets/icons/Icons';
import { VideoPlayer } from '../components/media/VideoPlayer';

export const Screen_DirectUnlock: React.FC = () => {
  const { user, isAuthenticated, login, isCloudConnected } = useAuth();
  const { activeSlug, navigateTo } = useNavigation();
  const { showToast } = useToast();

  const [mediaLink, setMediaLink] = useState<MediaLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const slug = activeSlug || window.location.hash.replace('#/u/', '').replace('#/p/', '').split('?')[0] || '';

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchAndUnlock = async () => {
      setIsLoading(true);

      // Check if user is authenticated
      if (!user || !user.email) {
        localStorage.setItem('pending_unlock_slug', slug);
        setIsUnlocked(false);

        // Fetch basic public info for preview card if available
        if (isCloudConnected) {
          const link = await supabaseService.getMediaLinkBySlug(slug);
          if (link) setMediaLink(link);
        }
        setIsLoading(false);
        return;
      }

      // User IS authenticated -> fetch and unlock
      if (isCloudConnected) {
        try {
          const link = await supabaseService.getMediaLinkBySlug(slug);
          if (link) {
            setMediaLink(link);
            await supabaseService.recordLinkUnlock(link.id, user.id);
            setIsUnlocked(true);
            showToast('Content Unlocked!', link.title, 'success');
          } else {
            // Check if it's a standard product drop
            setIsUnlocked(true);
          }
        } catch (err) {
          console.warn('Direct unlock fetch error:', err);
          setIsUnlocked(true);
        }
      } else {
        setIsUnlocked(true);
      }

      setIsLoading(false);
    };

    fetchAndUnlock();
  }, [slug, user, isCloudConnected]);

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    localStorage.setItem('pending_unlock_slug', slug);

    if (isCloudConnected) {
      const res = await supabaseService.signInWithGoogle();
      if (res?.error) {
        showToast('Google sign-in error', res.error.message, 'error');
        setIsGoogleLoading(false);
      }
    } else {
      const email = prompt('Enter your Google email:') || 'viewer@gmail.com';
      await login(email, 'buyer');
      setIsGoogleLoading(false);
      setIsUnlocked(true);
      showToast('Signed in & Unlocked!', undefined, 'success');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setIsSendingMagicLink(true);
    localStorage.setItem('pending_unlock_slug', slug);

    if (isCloudConnected) {
      const res = await supabaseService.signIn(emailInput);
      if (res?.error) {
        showToast('Magic link issue', res.error.message, 'error');
        setIsSendingMagicLink(false);
        return;
      }
      setMagicLinkSent(true);
      setIsSendingMagicLink(false);
      showToast('Magic link dispatched!', `Check ${emailInput} to unlock`, 'info');
    } else {
      await login(emailInput, 'buyer');
      setIsSendingMagicLink(false);
      setIsUnlocked(true);
      showToast('Signed in & Unlocked!', undefined, 'success');
    }
  };

  const handleDirectDownload = () => {
    if (!mediaLink?.mediaUrl) return;
    const a = document.createElement('a');
    a.href = mediaLink.mediaUrl;
    a.download = mediaLink.title || 'unlocked-content';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download started', undefined, 'success');
  };

  if (isLoading) {
    return (
      <div className="app-content no-bottom-nav p-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#111111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            VERIFYING UNLOCK PERMISSION...
          </div>
        </div>
      </div>
    );
  }

  // --- 1. NOT LOGGED IN / GATED STATE ---
  if (!isUnlocked || !user?.email) {
    return (
      <div className="app-content no-bottom-nav p-page" style={{ justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: '28px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Lock Icon Header */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#111111',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}
          >
            <LockIcon size={26} strokeWidth={2.2} />
          </div>

          <span className="badge badge-accent" style={{ marginBottom: 12 }}>
            AUTHENTICATION REQUIRED
          </span>

          <h2 style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>
            {mediaLink?.title || 'PRIVATE DIGITAL CONTENT'}
          </h2>

          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.45 }}>
            Sign in with Google or your email to unlock and view this exclusive content.
          </p>

          {/* 1-Tap Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-default)',
              color: '#111111',
              padding: '13px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: isGoogleLoading ? 'wait' : 'pointer',
              boxShadow: 'var(--shadow-card)',
              marginBottom: 16
            }}
          >
            <GoogleIcon size={19} />
            <span>{isGoogleLoading ? 'CONNECTING GOOGLE...' : 'SIGN IN WITH GOOGLE TO UNLOCK'}</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 16px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-default)' }} />
            <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              OR EMAIL
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-default)' }} />
          </div>

          {magicLinkSent ? (
            <div style={{ backgroundColor: '#ECFDF5', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
              <div style={{ color: '#059669', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>MAGIC LINK SENT</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Click the confirmation link sent to <strong>{emailInput}</strong> to unlock this page automatically.
              </div>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                required
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  fontSize: 13.5,
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
              <Button type="submit" variant="secondary" isLoading={isSendingMagicLink}>
                SEND UNLOCK LINK →
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- 2. AUTHENTICATED & UNLOCKED CONTENT VIEW ---
  return (
    <div className="app-content no-bottom-nav p-page" style={{ gap: 20 }}>
      {/* Success Unlocked Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
          <UnlockIcon size={18} strokeWidth={2.5} />
          <span style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            ACCESS GRANTED • {user.email}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>VERIFIED</span>
      </div>

      {/* Unlocked Media Card */}
      <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
        {mediaLink?.mediaType === 'image' || (mediaLink?.mediaUrl && (mediaLink.mediaUrl.endsWith('.jpg') || mediaLink.mediaUrl.endsWith('.png') || mediaLink.mediaUrl.endsWith('.webp'))) ? (
          <img
            src={mediaLink.mediaUrl}
            alt={mediaLink.title || 'Unlocked Media'}
            style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain', backgroundColor: '#000000', display: 'block' }}
          />
        ) : mediaLink?.mediaType === 'video' || (mediaLink?.mediaUrl && mediaLink.mediaUrl.endsWith('.mp4')) ? (
          <video
            src={mediaLink.mediaUrl}
            controls
            autoPlay
            playsInline
            style={{ width: '100%', maxHeight: '55vh', backgroundColor: '#000000', display: 'block' }}
          />
        ) : (
          <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', backgroundColor: '#F3F4F6', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <FileIcon size={32} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
              {mediaLink?.title || 'EXCLUSIVE DIGITAL PACKAGE'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Direct digital package ready for secure download.
            </p>
          </div>
        )}

        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
            {mediaLink?.title || 'UNLOCKED DIGITAL ASSET'}
          </h2>
          {mediaLink?.description && (
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.45 }}>
              {mediaLink.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Button
              variant="primary"
              onClick={handleDirectDownload}
              leftIcon={<DownloadIcon size={18} />}
            >
              DOWNLOAD ORIGINAL ASSET
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigateTo('home')}
            >
              DASHBOARD
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
