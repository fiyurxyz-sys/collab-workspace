'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const initDone = useRef(false);

  // On mount: try to restore session via refresh token cookie
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    (async () => {
      try {
        const { data } = await api.post<{ accessToken: string }>('/api/auth/refresh');
        window.__accessToken = data.accessToken;

        const meRes = await api.get<{ user: AuthUser }>('/api/auth/me');
        setUser(meRes.data.user);
      } catch {
        // No valid session — that's fine
        window.__accessToken = undefined;
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
        '/api/auth/login',
        { email, password },
      );
      window.__accessToken = data.accessToken;
      setUser(data.user);
      router.push('/dashboard');
    },
    [router],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
        '/api/auth/register',
        { email, password, name },
      );
      window.__accessToken = data.accessToken;
      setUser(data.user);
      router.push('/dashboard');
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      window.__accessToken = undefined;
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
