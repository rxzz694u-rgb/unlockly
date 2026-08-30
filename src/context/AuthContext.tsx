import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/db';
import { INITIAL_CREATOR, DEMO_BUYER } from '../services/demoData';
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
    if (saved) return saved;
    dbService.saveUser(INITIAL_CREATOR);
    return INITIAL_CREATOR;
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
        setUser(INITIAL_CREATOR);
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

    const newUser: User = role === 'buyer'
      ? { ...DEMO_BUYER, email: email || DEMO_BUYER.email }
      : { ...INITIAL_CREATOR, email: email || INITIAL_CREATOR.email };

    setUser(newUser);
    dbService.saveUser(newUser);
  };

  const logout = async () => {
    if (isCloudConnected && supabase) {
      await supabaseService.signOut();
    }
    setUser(null);
    localStorage.removeItem('unlockly_user');
  };

  const switchRole = (role: 'creator' | 'buyer') => {
    if (role === 'buyer') {
      setUser(DEMO_BUYER);
      dbService.saveUser(DEMO_BUYER);
    } else {
      setUser(INITIAL_CREATOR);
      dbService.saveUser(INITIAL_CREATOR);
    }
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
        isAuthenticated: !!user,
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
