import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LockIcon, ArrowRightIcon, CheckIcon, GoogleIcon, AppleIcon } from '../assets/icons/Icons';
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    showToast('Connecting to Google Auth...', undefined, 'info');

    try {
      if (isCloudConnected) {
        const res = await supabaseService.signInWithGoogle();
        if (res?.error) {
          showToast('Google sign-in error', res.error.message, 'error');
          setIsGoogleLoading(false);
          return;
        }
      } else {
        const userEmail = prompt('Enter your Google Account email:') || 'user@gmail.com';
        await login(userEmail, 'creator');
        showToast('Signed in with Google', userEmail, 'success');
        setIsGoogleLoading(false);
        navigateTo('home');
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      showToast('Google sign-in error', err?.message || 'Failed to authenticate', 'error');
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    showToast('Connecting to Apple ID...', undefined, 'info');

    try {
      if (isCloudConnected) {
        const res = await supabaseService.signInWithApple();
        if (res?.error) {
          showToast('Apple sign-in error', res.error.message, 'error');
          setIsAppleLoading(false);
          return;
        }
      } else {
        const userEmail = prompt('Enter your Apple ID email:') || 'user@icloud.com';
        await login(userEmail, 'creator');
        showToast('Signed in with Apple ID', userEmail, 'success');
        setIsAppleLoading(false);
        navigateTo('home');
      }
    } catch (err: any) {
      setIsAppleLoading(false);
      showToast('Apple sign-in error', err?.message || 'Failed to authenticate', 'error');
    }
  };

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
            showToast('Sign up failed', res.error.message, 'error');
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
      showToast('Authentication error', err?.message || 'Failed to sign in', 'error');
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
        backgroundColor: '#F8F8F6'
      }}
    >
      <div>
        {/* Header Branding */}
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
            {isCloudConnected ? 'CLOUD AUTH' : 'STANDBY'}
          </div>
        </div>

        <h1 className="text-headline" style={{ marginBottom: 6 }}>
          {isSignUp ? 'CREATE ACCOUNT.' : 'SIGN IN.'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          {isSignUp
            ? 'Monetize exclusive photos, videos, and private downloads.'
            : 'Access your creator earnings, analytics, and private links.'}
        </p>

        {/* Real OAuth Sign In Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
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
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: isGoogleLoading ? 'wait' : 'pointer',
              boxShadow: 'var(--shadow-card)',
              transition: 'background-color 0.15s ease, transform 0.1s ease'
            }}
          >
            <GoogleIcon size={19} />
            <span>{isGoogleLoading ? 'CONNECTING GOOGLE...' : 'CONTINUE WITH GOOGLE'}</span>
          </button>

          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={isAppleLoading}
            style={{
              width: '100%',
              backgroundColor: '#111111',
              border: '1px solid #111111',
              color: '#FFFFFF',
              padding: '13px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: 13.5,
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: isAppleLoading ? 'wait' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              transition: 'background-color 0.15s ease, transform 0.1s ease'
            }}
          >
            <AppleIcon size={19} />
            <span>{isAppleLoading ? 'CONNECTING APPLE...' : 'CONTINUE WITH APPLE'}</span>
          </button>
        </div>

        {/* Clean Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 20px 0' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-default)' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            OR EMAIL
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-default)' }} />
        </div>

        {magicLinkSent ? (
          <div className="surface-card" style={{ padding: '28px 16px', textAlign: 'center' }}>
            <div style={{ color: '#059669', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <CheckIcon size={36} strokeWidth={2.5} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
              MAGIC LINK DISPATCHED
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.45 }}>
              Check <strong>{email}</strong> for your secure 1-tap sign-in link.
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
                placeholder="Enter your name"
                required
              />
            )}

            <Input
              label="EMAIL ADDRESS"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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

            <div style={{ marginTop: 6 }}>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                rightIcon={<ArrowRightIcon size={16} />}
              >
                {isSignUp ? 'CREATE ACCOUNT' : authMode === 'magic_link' ? 'SEND MAGIC LINK →' : 'CONTINUE WITH EMAIL'}
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
              {authMode === 'password' ? 'Sign in with passwordless magic link' : 'Sign in with password'}
            </button>
          )}
        </div>
      </div>

      {/* Clean Trust Badge */}
      <div style={{ textAlign: 'center', paddingTop: 24, fontSize: 11.5, color: 'var(--text-tertiary)' }}>
        Encrypted & Secured by Unlockly Access Engine
      </div>
    </div>
  );
};
