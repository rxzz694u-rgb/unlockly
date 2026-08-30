import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LockIcon, ArrowRightIcon, ShieldIcon, CheckIcon } from '../assets/icons/Icons';
import { supabaseService, isSupabaseConfigured } from '../services/supabase';

export const Screen2_Auth: React.FC = () => {
  const { login, isCloudConnected } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [authMode, setAuthMode] = useState<'password' | 'magic_link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      if (isCloudConnected) {
        if (authMode === 'magic_link') {
          await supabaseService.signIn(email);
          setMagicLinkSent(true);
          showToast('Magic link dispatched', `Check ${email} to sign in`, 'info');
          setIsLoading(false);
          return;
        }

        if (isSignUp) {
          const res = await supabaseService.signUp(email, password);
          if (res?.error) {
            showToast('Sign up issue', res.error.message, 'error');
            setIsLoading(false);
            return;
          }
          showToast('Account created!', email, 'success');
        } else {
          const res = await supabaseService.signIn(email, password);
          if (res?.error) {
            showToast('Sign in failed', res.error.message, 'error');
            setIsLoading(false);
            return;
          }
          showToast('Welcome back!', email, 'success');
        }
      }

      await login(email, 'creator', password);
      setIsLoading(false);
      navigateTo('home');
    } catch (err: any) {
      setIsLoading(false);
      showToast('Authentication notice', err?.message || 'Logged in locally', 'info');
      await login(email, 'creator');
      navigateTo('home');
    }
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
        {/* Brand Lock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <LockIcon size={18} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase' }}>UNLOCKLY</span>
          </div>

          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isCloudConnected ? '#ECFDF5' : '#F3F4F6',
              color: isCloudConnected ? '#059669' : '#6B7280',
              border: `1px solid ${isCloudConnected ? '#A7F3D0' : '#E5E7EB'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isCloudConnected ? '#059669' : '#9CA3AF' }} />
            {isCloudConnected ? 'CLOUD AUTH' : 'LOCAL MODE'}
          </div>
        </div>

        <h1 className="text-headline" style={{ marginBottom: 6 }}>
          {isSignUp ? 'CREATE ACCOUNT.' : 'WELCOME BACK.'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          {isSignUp
            ? 'Start uploading and monetizing your exclusive content in seconds.'
            : 'Access your creator earnings, analytics, and private links.'}
        </p>

        {magicLinkSent ? (
          <div className="surface-card" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ color: '#059669', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
              <CheckIcon size={32} strokeWidth={2.5} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
              MAGIC LINK SENT
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.45 }}>
              Click the link sent to <strong>{email}</strong> to sign in automatically.
            </p>
            <Button variant="secondary" onClick={() => setMagicLinkSent(false)}>
              USE PASSWORD INSTEAD
            </Button>
          </div>
        ) : (
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
              label="EMAIL ADDRESS"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
            />

            {authMode === 'password' && (
              <Input
                label="PASSWORD"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            )}

            <div style={{ marginTop: 8 }}>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                rightIcon={<ArrowRightIcon size={16} />}
              >
                {isSignUp ? 'CREATE ACCOUNT' : authMode === 'magic_link' ? 'SEND MAGIC LINK →' : 'CONTINUE'}
              </Button>
            </div>
          </form>
        )}

        {/* Mode Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, textAlign: 'center' }}>
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

          {!isSignUp && (
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'password' ? 'magic_link' : 'password')}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 12,
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {authMode === 'password' ? 'Sign in with Passwordless Magic Link' : 'Sign in with Password'}
            </button>
          )}
        </div>
      </div>

      {/* Instant Demo Quick Access */}
      <div
        style={{
          marginTop: 32,
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          FAST DEMO SIGN IN (1-TAP TEST)
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
