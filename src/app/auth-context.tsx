/**
 * Authentication Context for Calyx Command
 * 
 * Provides authentication state and methods throughout the app.
 * Supports both real login and Demo Mode.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Organization } from '@/lib/types';
import { authApi, demoApi } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

interface AuthState {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  startDemoMode: () => Promise<void>;
  resetDemo: () => Promise<void>;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  AUTH_TOKEN: 'calyx_auth_token',
  DEMO_MODE: 'calyx_demo_mode',
  USER: 'calyx_user',
  ORG: 'calyx_org',
} as const;

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    organization: null,
    isAuthenticated: false,
    isDemoMode: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const isDemoMode = localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const savedOrg = localStorage.getItem(STORAGE_KEYS.ORG);

        if (token && savedUser && savedOrg) {
          setState({
            user: JSON.parse(savedUser),
            organization: JSON.parse(savedOrg),
            isAuthenticated: true,
            isDemoMode,
            isLoading: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        // Clear any corrupted data
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      // Store auth data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(response.organization));
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'false');

      setState({
        user: response.user,
        organization: response.organization,
        isAuthenticated: true,
        isDemoMode: false,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with logout even if API fails
    }

    // Clear all auth data
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

    setState({
      user: null,
      organization: null,
      isAuthenticated: false,
      isDemoMode: false,
      isLoading: false,
    });
  }, []);

  const startDemoMode = useCallback(async () => {
    try {
      // Initialize demo data
      const response = await authApi.initDemoMode();

      // Store demo auth data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(response.organization));
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');

      setState({
        user: response.user,
        organization: response.organization,
        isAuthenticated: true,
        isDemoMode: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  }, []);

  const resetDemo = useCallback(async () => {
    try {
      await demoApi.resetData();
      
      // Re-initialize demo
      const response = await authApi.initDemoMode();

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(response.organization));

      setState(prev => ({
        ...prev,
        user: response.user,
        organization: response.organization,
      }));
    } catch (error) {
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    startDemoMode,
    resetDemo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============================================================================
// Protected Route Component
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
