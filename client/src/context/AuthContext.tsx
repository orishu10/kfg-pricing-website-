import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api';

interface AuthState {
  token: string | null;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('kfg_token');
    const username = localStorage.getItem('kfg_username');
    return { token, username };
  });

  useEffect(() => {
    if (auth.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [auth.token]);

  function login(token: string, username: string) {
    localStorage.setItem('kfg_token', token);
    localStorage.setItem('kfg_username', username);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuth({ token, username });
  }

  function logout() {
    localStorage.removeItem('kfg_token');
    localStorage.removeItem('kfg_username');
    delete api.defaults.headers.common['Authorization'];
    setAuth({ token: null, username: null });
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isAuthenticated: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
