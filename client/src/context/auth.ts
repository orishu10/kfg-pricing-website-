import { createContext, useContext } from 'react';
import type { AppModule, AuthSession, UserRole } from '../api';

export type AccessRequirement = AppModule | 'admin';

export interface AuthState {
  token: string | null;
  username: string | null;
  role: UserRole | null;
  permissions: AppModule[];
}

export interface AuthContextValue extends AuthState {
  login: (session: AuthSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canAccess: (requirement: AccessRequirement) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
