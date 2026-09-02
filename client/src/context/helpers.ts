import type { AppModule, AuthSession, UserRole } from '../api';
import type { AccessRequirement, AuthState } from './auth';
import { STORAGE_KEYS, USER_ROLES, APP_MODULES } from './consts';

const isUserRole = (value: string | null): value is UserRole =>
  !!value && (USER_ROLES as readonly string[]).includes(value);

const isAppModule = (value: unknown): value is AppModule =>
  typeof value === 'string' && (APP_MODULES as readonly string[]).includes(value);

const parsePermissions = (raw: string | null): AppModule[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isAppModule) : [];
  } catch {
    return [];
  }
};

export const readStoredSession = (): AuthState => {
  const role = localStorage.getItem(STORAGE_KEYS.role);
  return {
    token: localStorage.getItem(STORAGE_KEYS.token),
    username: localStorage.getItem(STORAGE_KEYS.username),
    role: isUserRole(role) ? role : null,
    permissions: parsePermissions(localStorage.getItem(STORAGE_KEYS.permissions)),
  };
};

export const storeSession = (session: AuthSession) => {
  localStorage.setItem(STORAGE_KEYS.token, session.token);
  localStorage.setItem(STORAGE_KEYS.username, session.username);
  localStorage.setItem(STORAGE_KEYS.role, session.role);
  localStorage.setItem(STORAGE_KEYS.permissions, JSON.stringify(session.permissions));
};

export const clearStoredSession = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};

export const accessIsAllowed = (auth: AuthState, requirement: AccessRequirement): boolean => {
  if (requirement === 'admin') return auth.role === 'admin';
  return (
    auth.role === 'admin' ||
    auth.role === 'manager' ||
    (auth.role === 'user' && auth.permissions.includes(requirement))
  );
};
