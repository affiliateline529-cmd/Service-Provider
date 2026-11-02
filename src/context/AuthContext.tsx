import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, mobile: string, password?: string, role?: 'customer' | 'provider') => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  toggleFavorite: (businessId: string) => Promise<boolean>;
  isFavorite: (businessId: string) => boolean;
  isAdmin: boolean;
  isProvider: boolean;
  switchDemoUser: (role: 'customer' | 'provider' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('sp_karachi_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Default demo logged-in user: Customer Shehbaz Abro
    return {
      id: 'user-customer-1',
      name: 'Shehbaz Abro',
      email: 'shehbaz@example.com',
      mobile: '0333-2891045',
      role: 'customer',
      savedFavorites: ['biz-1', 'biz-4', 'biz-10'],
      createdAt: '2026-01-15T12:30:00.000Z'
    };
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sp_karachi_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sp_karachi_user');
    }
  }, [currentUser]);

  const login = async (email: string, password: string = 'password'): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentUser(data.data);
        return { success: true, message: data.message || 'Logged in successfully' };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  const register = async (
    name: string,
    email: string,
    mobile: string,
    password: string = 'password',
    role: 'customer' | 'provider' = 'customer'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password, role })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentUser(data.data);
        return { success: true, message: data.message || 'Account created successfully' };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleFavorite = async (businessId: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, businessId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(prev => prev ? { ...prev, savedFavorites: data.favorites } : null);
        return data.isSaved;
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }

    // Local fallback
    let isSaved = false;
    setCurrentUser(prev => {
      if (!prev) return null;
      const favs = prev.savedFavorites || [];
      const idx = favs.indexOf(businessId);
      let updated: string[];
      if (idx >= 0) {
        updated = favs.filter(id => id !== businessId);
        isSaved = false;
      } else {
        updated = [...favs, businessId];
        isSaved = true;
      }
      return { ...prev, savedFavorites: updated };
    });
    return isSaved;
  };

  const isFavorite = (businessId: string): boolean => {
    return Boolean(currentUser?.savedFavorites?.includes(businessId));
  };

  const switchDemoUser = (role: 'customer' | 'provider' | 'admin') => {
    if (role === 'admin') {
      setCurrentUser({
        id: 'user-admin',
        name: 'Administrator (Karachi HQ)',
        email: 'admin@serviceprovider.pk',
        mobile: '0300-8273641',
        role: 'admin',
        savedFavorites: ['biz-1', 'biz-3', 'biz-7'],
        createdAt: '2026-01-01T10:00:00.000Z'
      });
    } else if (role === 'provider') {
      setCurrentUser({
        id: 'user-provider-1',
        name: 'Ustad Tariq Mehmood',
        email: 'tariq@electrician.pk',
        mobile: '0300-2415892',
        role: 'provider',
        savedFavorites: [],
        businessId: 'biz-1',
        createdAt: '2026-01-05T09:15:00.000Z'
      });
    } else {
      setCurrentUser({
        id: 'user-customer-1',
        name: 'Shehbaz Abro',
        email: 'shehbaz@example.com',
        mobile: '0333-2891045',
        role: 'customer',
        savedFavorites: ['biz-1', 'biz-4', 'biz-10'],
        createdAt: '2026-01-15T12:30:00.000Z'
      });
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isProvider = currentUser?.role === 'provider';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        register,
        logout,
        toggleFavorite,
        isFavorite,
        isAdmin,
        isProvider,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
