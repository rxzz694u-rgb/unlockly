import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LockIcon, ArrowRightIcon } from '../assets/icons/Icons';

export const Screen2_Auth: React.FC = () => {
  const { login } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('riyaz@unlockly.io');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Riyaz Ahmed');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(async () => {
      await login(email, 'creator');
      setIsLoading(false);
      showToast(isSignUp ? 'Account created successfully' : 'Welcome back!', email, 'success');
      navigateTo('home');
    }, 600);
  };

  const handleFastDemoLogin = (role: 'creator' | 'buyer') => {
    if (role === 'creator') {
      login('riyaz@unlockly.io', 'creator');
      showToast('Logged in as Creator (Riyaz)', undefined, 'success');
    } else {
      login('sarah.c@gmail.com', 'buyer');
      showToast('Logged in as Buyer (Sarah)', undefined, 'success');
    }
    navigateTo('home');
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 20px 24px 20px',
        minHeight: '100dvh',
        backgroundColor: '#F8F8F6'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#111111',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LockIcon size={18} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase' }}>UNLOCKLY</span>
        </div>

        <h1 className="text-headline" style={{ marginBottom: 6 }}>
          {isSignUp ? 'CREATE ACCOUNT.' : 'WELCOME BACK.'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
          {isSignUp
            ? 'Start uploading and monetizing your exclusive content in seconds.'
            : 'Access your creator earnings and private links.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isSignUp && (
            <Input
              label="FULL NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Riyaz Ahmed"
              required
            />
          )}

          <Input
            label="EMAIL"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            required
          />

          <Input
            label="PASSWORD"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div style={{ marginTop: 8 }}>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              rightIcon={<ArrowRightIcon size={16} />}
            >
              {isSignUp ? 'CREATE ACCOUNT' : 'CONTINUE'}
            </Button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 13,
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <strong style={{ color: '#111111' }}>{isSignUp ? 'Sign In' : 'Create Account'}</strong>
          </button>
        </div>
      </div>

      {/* Instant Demo Role Switcher */}
      <div
        style={{
          marginTop: 36,
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          FAST DEMO SIGN IN
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Button
            variant="secondary"
            onClick={() => handleFastDemoLogin('creator')}
            style={{ padding: '10px 12px', fontSize: 12 }}
          >
            CREATOR RIYAZ
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleFastDemoLogin('buyer')}
            style={{ padding: '10px 12px', fontSize: 12 }}
          >
            BUYER SARAH
          </Button>
        </div>
      </div>
    </div>
  );
};
