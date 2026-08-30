import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/db';
import { INITIAL_CREATOR, DEMO_BUYER } from '../services/demoData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isCreator: boolean;
  login: (email: string, role?: 'creator' | 'buyer') => Promise<void>;
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

  useEffect(() => {
    if (user) {
      dbService.saveUser(user);
    }
  }, [user]);

  const login = async (email: string, role: 'creator' | 'buyer' = 'creator') => {
    let newUser: User;
    if (role === 'buyer') {
      newUser = {
        ...DEMO_BUYER,
        email: email || DEMO_BUYER.email
      };
    } else {
      newUser = {
        ...INITIAL_CREATOR,
        email: email || INITIAL_CREATOR.email
      };
    }
    setUser(newUser);
    dbService.saveUser(newUser);
  };

  const logout = () => {
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
