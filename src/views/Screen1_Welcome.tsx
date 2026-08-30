import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useNavigation } from '../context/NavigationContext';
import { Button } from '../components/common/Button';
import { LockIcon, UnlockIcon, ArrowRightIcon, ZapIcon, ShieldIcon, LinkIcon } from '../assets/icons/Icons';

export const Screen1_Welcome: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [isDemoUnlocked, setIsDemoUnlocked] = useState(false);

  const handleDemoToggle = () => {
    const nextState = !isDemoUnlocked;
    setIsDemoUnlocked(nextState);

    if (nextState) {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.5 },
          colors: ['#111111', '#059669', '#A7F3D0']
        });
      } catch {
        // Safe fallback
      }
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 20px 28px 20px',
        minHeight: '100dvh',
        backgroundColor: '#F8F8F6',
        overflowX: 'hidden'
      }}
    >
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Brand Header */}
        <div
          className="anim-entry-1"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#111111',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}
            >
              <LockIcon size={18} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
              UNLOCKLY
            </span>
          </div>

          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '4px 9px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-default)',
              color: '#059669',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#059669' }} />
            V1.0 LIVE
          </div>
        </div>

        {/* Hero Headlines */}
        <div className="anim-entry-2" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase'
            }}
          >
            PRIVATE CONTENT. INSTANT ACCESS.
          </span>

          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.045em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}
          >
            SELL ACCESS.<br />SIMPLY.
          </h1>

          <p
            style={{
              fontSize: 14.5,
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              marginTop: 2,
              maxWidth: '310px'
            }}
          >
            Upload private content. Set your price. Share one secure link.
          </p>
        </div>

        {/* Interactive Live Unlock Simulator */}
        <div className="anim-entry-3" style={{ marginTop: 22 }}>
          <div
            onClick={handleDemoToggle}
            className="surface-card surface-card-interactive anim-float"
            style={{
              padding: 0,
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              border: isDemoUnlocked ? '1.5px solid #059669' : '1px solid var(--border-default)',
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isDemoUnlocked ? '0 8px 24px rgba(5, 150, 105, 0.15)' : 'var(--shadow-card)'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                backgroundColor: '#1E1E1E',
                overflow: 'hidden'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
                alt="Demo Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: isDemoUnlocked ? 'none' : 'blur(20px) brightness(0.65) saturate(1.2)',
                  transform: isDemoUnlocked ? 'scale(1)' : 'scale(1.12)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />

              {/* Status Badge Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: 16
                }}
              >
                {!isDemoUnlocked ? (
                  <div
                    style={{
                      backgroundColor: 'rgba(17, 17, 17, 0.75)',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 11.5,
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}
                  >
                    <LockIcon size={14} strokeWidth={2.4} />
                    <span>LOCKED • AED 25.00</span>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 11.5,
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                      animation: 'popIn 0.3s var(--spring-smooth)'
                    }}
                  >
                    <UnlockIcon size={14} strokeWidth={2.4} />
                    <span>UNLOCKED • ACCESS GRANTED</span>
                  </div>
                )}
              </div>
            </div>

            {/* Micro Caption */}
            <div
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                {isDemoUnlocked ? 'FULL HIGH-RES ASSET ACTIVE' : 'TAP TO TEST UNLOCK SIMULATION'}
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: isDemoUnlocked ? '#059669' : '#111111' }}>
                {isDemoUnlocked ? 'RESET ↺' : 'TRY IT →'}
              </span>
            </div>
          </div>
        </div>

        {/* Value Props Row with Clean iOS SVGs */}
        <div
          className="anim-entry-4"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 18
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 6px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <div style={{ color: '#111111' }}>
              <ZapIcon size={18} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: '#111111' }}>
              Instant Pay
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 6px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <div style={{ color: '#111111' }}>
              <ShieldIcon size={18} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: '#111111' }}>
              Encrypted
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 6px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <div style={{ color: '#111111' }}>
              <LinkIcon size={18} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: '#111111' }}>
              1 Smart Link
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="anim-entry-5" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        <Button
          variant="primary"
          onClick={() => navigateTo('create_step1')}
          rightIcon={<ArrowRightIcon size={18} />}
        >
          CREATE YOUR FIRST LINK
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigateTo('home')}
        >
          EXPLORE CREATOR HUB
        </Button>

        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <button
            type="button"
            onClick={() => navigateTo('auth')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 13,
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Already have an account? <strong style={{ color: '#111111' }}>Sign in</strong>
          </button>
        </div>
      </div>
    </div>
  );
};
