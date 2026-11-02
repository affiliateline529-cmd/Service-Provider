import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  sessionToken: string | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string; requiresWindowAuth?: boolean }>;
  register: (name: string, email: string, mobile: string, password?: string, role?: 'customer' | 'provider') => Promise<{ success: boolean; message: string; requiresWindowAuth?: boolean }>;
  logout: () => Promise<void>;
  toggleFavorite: (businessId: string) => Promise<boolean>;
  isFavorite: (businessId: string) => boolean;
  isAdmin: boolean;
  isProvider: boolean;
  switchDemoUser: (role: 'customer' | 'provider' | 'admin') => Promise<void>;
  openNewWindowAuth: () => void;
  isCookieBlocked: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe storage utilities to prevent crashing in Safari private mode or blocked storage
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // In-memory fallback
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Fallback
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return safeGetItem('sp_karachi_token');
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = safeGetItem('sp_karachi_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback
      }
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

  const [isCookieBlocked, setIsCookieBlocked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if cookies or storage are restricted in this browsing environment (e.g., iframe on iOS / Chrome Android)
  useEffect(() => {
    try {
      const testKey = '__cookie_storage_check__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);

      // Check if running inside an iframe where third-party cookies might be blocked
      const isInsideIframe = window.self !== window.top;
      if (isInsideIframe && !document.cookie && !navigator.cookieEnabled) {
        setIsCookieBlocked(true);
      }
    } catch {
      setIsCookieBlocked(true);
    }
  }, []);

  // Sync user & token to safe storage
  useEffect(() => {
    if (currentUser) {
      safeSetItem('sp_karachi_user', JSON.stringify(currentUser));
    } else {
      safeRemoveItem('sp_karachi_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (sessionToken) {
      safeSetItem('sp_karachi_token', sessionToken);
    } else {
      safeRemoveItem('sp_karachi_token');
    }
  }, [sessionToken]);

  // Handle URL parameters returned from standalone redirect window (?token=...&auth_status=success)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const urlToken = url.searchParams.get('token');
      const authStatus = url.searchParams.get('auth_status');

      if (urlToken) {
        setSessionToken(urlToken);
        safeSetItem('sp_karachi_token', urlToken);

        // Remove token parameter from URL to maintain clean URL and avoid token leakage in history
        url.searchParams.delete('token');
        url.searchParams.delete('auth_status');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));

        // Validate session with server
        validateSession(urlToken);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Listen for SP_AUTH_SUCCESS postMessage from the standalone authentication window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SP_AUTH_SUCCESS') {
        const { token, user } = event.data;
        if (token && user) {
          setSessionToken(token);
          setCurrentUser(user);
          safeSetItem('sp_karachi_token', token);
          safeSetItem('sp_karachi_user', JSON.stringify(user));
          setAuthError(null);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Validate active session against server
  const validateSession = useCallback(async (tokenToCheck?: string) => {
    const token = tokenToCheck || sessionToken || safeGetItem('sp_karachi_token');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (currentUser?.id) {
        headers['x-user-id'] = currentUser.id;
      }

      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers,
        credentials: 'include' // Sends secure cookie if allowed
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCurrentUser(data.data);
          if (data.token) {
            setSessionToken(data.token);
            safeSetItem('sp_karachi_token', data.token);
          }
        }
      }
    } catch {
      // Offline or network error
    }
  }, [sessionToken, currentUser?.id]);

  // Initial session verification
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // "Authenticate in new window" - Standard first-party authentication flow
  const openNewWindowAuth = () => {
    setAuthError(null);
    const width = 460;
    const height = 680;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    const popupUrl = '/auth/window?popup=1';

    try {
      const popup = window.open(
        popupUrl,
        'ServiceProviderAuthWindow',
        `width=${width},height=${height},left=${left},top=${top},status=yes,toolbar=no,menubar=no,location=yes,resizable=yes,scrollbars=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Browser blocked popup window; use top-level navigation instead
        window.location.href = `/auth/window?return_url=${encodeURIComponent(window.location.href)}`;
      } else {
        popup.focus();
      }
    } catch {
      window.location.href = `/auth/window?return_url=${encodeURIComponent(window.location.href)}`;
    }
  };

  const login = async (email: string, password: string = 'password'): Promise<{ success: boolean; message: string; requiresWindowAuth?: boolean }> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCurrentUser(data.data);
        if (data.token) {
          setSessionToken(data.token);
          safeSetItem('sp_karachi_token', data.token);
        }
        return { success: true, message: data.message || 'Logged in successfully' };
      }

      setAuthError(data.message || 'Login failed. Please check your credentials.');
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.message || 'Network error during login';
      setAuthError(msg);
      return { success: false, message: msg, requiresWindowAuth: true };
    }
  };

  const register = async (
    name: string,
    email: string,
    mobile: string,
    password: string = 'password',
    role: 'customer' | 'provider' = 'customer'
  ): Promise<{ success: boolean; message: string; requiresWindowAuth?: boolean }> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, mobile, password, role })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCurrentUser(data.data);
        if (data.token) {
          setSessionToken(data.token);
          safeSetItem('sp_karachi_token', data.token);
        }
        return { success: true, message: data.message || 'Account created successfully' };
      }

      setAuthError(data.message || 'Registration failed');
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: any) {
      const msg = err.message || 'Network error during registration';
      setAuthError(msg);
      return { success: false, message: msg, requiresWindowAuth: true };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // Local clean up anyway
    }
    setCurrentUser(null);
    setSessionToken(null);
    safeRemoveItem('sp_karachi_user');
    safeRemoveItem('sp_karachi_token');
  };

  const switchDemoUser = async (role: 'customer' | 'provider' | 'admin') => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentUser(data.data);
        if (data.token) {
          setSessionToken(data.token);
          safeSetItem('sp_karachi_token', data.token);
        }
        return;
      }
    } catch {
      // Fallback local switch
    }

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

  const toggleFavorite = async (businessId: string): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
      headers['x-user-id'] = currentUser.id;

      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers,
        credentials: 'include',
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

  const isAdmin = currentUser?.role === 'admin';
  const isProvider = currentUser?.role === 'provider';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        sessionToken,
        setCurrentUser,
        login,
        register,
        logout,
        toggleFavorite,
        isFavorite,
        isAdmin,
        isProvider,
        switchDemoUser,
        openNewWindowAuth,
        isCookieBlocked,
        authError,
        setAuthError
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

