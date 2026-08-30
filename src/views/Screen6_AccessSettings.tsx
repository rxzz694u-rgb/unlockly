import React from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { Button } from '../components/common/Button';
import { EyeIcon, EyeOffIcon, LockIcon, ShieldIcon, ArrowRightIcon } from '../assets/icons/Icons';
import { AccessType } from '../types';

export const Screen6_AccessSettings: React.FC = () => {
  const { draft, updateDraft } = useProducts();
  const { navigateTo } = useNavigation();

  const options: { id: AccessType; title: string; desc: string; badge: string; icon: React.ReactNode }[] = [
    {
      id: 'blurred',
      title: 'BLURRED VISUAL PREVIEW',
      desc: 'Generates an aesthetic frosted-glass blur teaser. Original protected high-res assets remain completely private on the server.',
      badge: 'RECOMMENDED',
      icon: <EyeOffIcon size={20} />
    },
    {
      id: 'locked',
      title: 'FULL SECURE LOCK',
      desc: 'No visual preview is shown publicly. Buyers see title, metadata, file count, and lock banner.',
      badge: 'MAX PRIVACY',
      icon: <LockIcon size={20} />
    },
    {
      id: 'preview',
      title: 'FIRST FILE PUBLIC TEASER',
      desc: 'First image/video snippet is visible for preview. Remaining files and downloads are locked until checkout.',
      badge: 'HYBRID',
      icon: <EyeIcon size={20} />
    }
  ];

  return (
    <div className="app-content no-bottom-nav">
      <div className="p-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <span className="text-label">STEP 3 OF 5</span>
          <h1 className="text-headline" style={{ marginTop: 2 }}>
            ACCESS RULES.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Control how buyers experience your public link before paying.
          </p>
        </div>

        {/* Security Reassurance Pill */}
        <div
          style={{
            backgroundColor: '#111111',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <ShieldIcon size={24} style={{ color: '#10B981', flexShrink: 0 }} />
          <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>
            <strong>ZERO LEAK GUARANTEE:</strong> High-res originals are never delivered over the network until payment is verified.
          </div>
        </div>

        {/* Visual Flow Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>1. PREVIEW</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Teaser / Blur</div>
          </div>
          <span style={{ color: '#A3A3A3', fontSize: 12 }}>→</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>2. LOCKED</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Verify Pay</div>
          </div>
          <span style={{ color: '#A3A3A3', fontSize: 12 }}>→</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>3. UNLOCKED</div>
            <div style={{ fontSize: 10, color: '#777777' }}>Stream / ZIP</div>
          </div>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map((opt) => {
            const isSelected = draft.accessType === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => updateDraft({ accessType: opt.id })}
                className="surface-card surface-card-interactive"
                style={{
                  border: isSelected ? '2px solid #111111' : '1px solid var(--border-default)',
                  backgroundColor: isSelected ? '#FFFFFF' : '#FFFFFF',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? '#111111' : 'var(--bg-surface-subtle)',
                        color: isSelected ? '#FFFFFF' : '#111111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {opt.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, textTransform: 'uppercase' }}>
                        {opt.title}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          color: isSelected ? '#059669' : '#777777',
                          textTransform: 'uppercase'
                        }}
                      >
                        {opt.badge}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #111111' : '2px solid var(--border-default)',
                      backgroundColor: '#FFFFFF',
                      flexShrink: 0
                    }}
                  />
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.45 }}>
                  {opt.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Age Restriction Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
            padding: '14px',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)'
          }}
        >
          <input
            type="checkbox"
            checked={draft.requiresAgeGate}
            onChange={(e) => updateDraft({ requiresAgeGate: e.target.checked })}
            style={{ marginTop: 2, accentColor: '#111111' }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Require 18+ Age Gate & Consent Verification</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
              Display an access verification gate prior to checkout.
            </div>
          </div>
        </label>
      </div>

      {/* Sticky Bottom Action */}
      <div className="sticky-bottom-bar">
        <Button
          variant="primary"
          onClick={() => navigateTo('create_step4')}
          rightIcon={<ArrowRightIcon size={18} />}
        >
          CONTINUE TO PRICING
        </Button>
      </div>
    </div>
  );
};
