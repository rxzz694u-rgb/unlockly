import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckIcon } from '../../assets/icons/Icons';

interface SuccessStateProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  triggerConfetti?: boolean;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = 'ACCESS GRANTED.',
  subtitle = 'Your transaction was successful.',
  children,
  triggerConfetti = true
}) => {
  useEffect(() => {
    if (triggerConfetti) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#111111', '#059669', '#777777', '#E4E4E0']
        });
      } catch {
        // Safe fallback
      }
    }
  }, [triggerConfetti]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '32px 18px 24px 18px'
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#111111',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          animation: 'popIn 0.4s var(--spring-smooth)'
        }}
      >
        <CheckIcon size={36} strokeWidth={2.5} />
      </div>

      <h2
        style={{
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          marginBottom: 8
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          maxWidth: '300px',
          lineHeight: 1.4,
          marginBottom: 24
        }}
      >
        {subtitle}
      </p>

      {children}
    </div>
  );
};
