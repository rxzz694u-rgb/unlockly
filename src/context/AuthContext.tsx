import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/db';
import { INITIAL_USER } from '../services/demoData';
import { supabase, isSupabaseConfigured, supabaseService } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isCreator: boolean;
  isCloudConnected: boolean;
  login: (email: string, role?: 'creator' | 'buyer', password?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'creator' | 'buyer') => void;
  updateProfile: (updated: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCleanStoredUser(): User {
  const saved = dbService.getUser();
  if (saved && saved.email) {
    // Purge old unsplash avatar from cache if present
    if (saved.avatar && saved.avatar.includes('unsplash.com')) {
      saved.avatar = '';
      saved.avatarUrl = '';
      dbService.saveUser(saved);
    }
    return saved;
  }
  return INITIAL_USER;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getCleanStoredUser());

  const isCloudConnected = isSupabaseConfigured();

  // Listen for real Supabase auth state changes and sync live from OAuth / Email session
  useEffect(() => {
    if (!isCloudConnected || !supabase) return;

    // 1. Initial Session Check (restores active Google or Magic Link session)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const cloudUser = await supabaseService.syncUserProfile(session.user);
        if (cloudUser) {
          setUser(cloudUser);
          dbService.saveUser(cloudUser);
        }
      }
    });

    // 2. Auth State Change Listener (fires on SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
        const cloudUser = await supabaseService.syncUserProfile(session.user);
        if (cloudUser) {
          setUser(cloudUser);
          dbService.saveUser(cloudUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(INITIAL_USER);
        localStorage.removeItem('unlockly_user');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isCloudConnected]);

  useEffect(() => {
    if (user && user.email) {
      dbService.saveUser(user);
    }
  }, [user]);

  const login = async (email: string, role: 'creator' | 'buyer' = 'creator', password?: string) => {
    if (isCloudConnected && supabase) {
      try {
        await supabaseService.signIn(email, password);
      } catch (err) {
        console.warn('Supabase sign-in note:', err);
      }
    }

    const cleanName = email.split('@')[0] || 'Creator';
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: cleanName,
      displayName: cleanName,
      email: email,
      avatar: '',
      avatarUrl: '',
      handle: cleanName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      role: role,
      isCustomProfile: false,
      balance: 0,
      totalEarnings: 0,
      currency: 'AED',
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    dbService.saveUser(newUser);
  };

  const logout = async () => {
    if (isCloudConnected && supabase) {
      await supabaseService.signOut();
    }
    setUser(INITIAL_USER);
    localStorage.removeItem('unlockly_user');
  };

  const switchRole = (role: 'creator' | 'buyer') => {
    if (!user) return;
    const nextUser: User = { ...user, role };
    setUser(nextUser);
    dbService.saveUser(nextUser);
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!user) return;
    const nextUser: User = {
      ...user,
      ...updated,
      name: updated.name || updated.displayName || user.name,
      displayName: updated.displayName || updated.name || user.displayName,
      avatar: updated.avatar || updated.avatarUrl || user.avatar || '',
      avatarUrl: updated.avatarUrl || updated.avatar || user.avatarUrl || '',
      isCustomProfile: true
    };
    setUser(nextUser);
    dbService.saveUser(nextUser);

    if (isCloudConnected && user.id) {
      await supabaseService.updateUserProfile(user.id, {
        displayName: nextUser.name,
        avatarUrl: nextUser.avatar,
        handle: nextUser.handle,
        currency: nextUser.currency,
        payoutIban: nextUser.payoutIban
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user?.email,
        isCreator: user?.role === 'creator',
        isCloudConnected,
        login,
        logout,
        switchRole,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
