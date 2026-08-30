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
  updateProfile: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = dbService.getUser();
    if (saved && saved.email) return saved;
    return INITIAL_USER;
  });

  const isCloudConnected = isSupabaseConfigured();

  // Listen for real Supabase auth state changes
  useEffect(() => {
    if (!isCloudConnected || !supabase) return;

    supabaseService.getCurrentUser().then((cloudUser) => {
      if (cloudUser) {
        setUser(cloudUser);
        dbService.saveUser(cloudUser);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const cloudUser = await supabaseService.getCurrentUser();
        if (cloudUser) {
          setUser(cloudUser);
          dbService.saveUser(cloudUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(INITIAL_USER);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isCloudConnected]);

  useEffect(() => {
    if (user) {
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

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0] || 'Creator',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      handle: email.split('@')[0] || 'creator',
      role: role,
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

  const updateProfile = (updated: Partial<User>) => {
    if (!user) return;
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    dbService.saveUser(nextUser);
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
