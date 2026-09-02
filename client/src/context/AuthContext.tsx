import { useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../api';
import { AuthContext, type AuthState } from './auth';
import { readStoredSession, storeSession, clearStoredSession, accessIsAllowed } from './helpers';
import type { AccessRequirement } from './auth';
import type { AuthSession } from '../api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(readStoredSession);

  useEffect(() => {
    if (auth.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [auth.token]);

  const login = (session: AuthSession) => {
    storeSession(session);
    api.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
    setAuth({
      token: session.token,
      username: session.username,
      role: session.role,
      permissions: session.permissions,
    });
  };

  const logout = useCallback(() => {
    clearStoredSession();
    delete api.defaults.headers.common['Authorization'];
    setAuth({ token: null, username: null, role: null, permissions: [] });
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const url: string = error?.config?.url ?? '';
        if (status === 401 && !url.includes('/auth/login')) logout();
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [logout]);

  const canAccess = (requirement: AccessRequirement) => accessIsAllowed(auth, requirement);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
        isAuthenticated: !!auth.token,
        isAdmin: auth.role === 'admin',
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
