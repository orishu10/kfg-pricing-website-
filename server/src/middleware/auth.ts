import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

export const APP_MODULES = ['dbm', 'pricing', 'logistics', 'reports'] as const;
export type AppModule = (typeof APP_MODULES)[number];

export const USER_ROLES = ['admin', 'manager', 'user', 'customer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  permissions: AppModule[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const jwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
};

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);

export const isAppModule = (value: unknown): value is AppModule =>
  typeof value === 'string' && (APP_MODULES as readonly string[]).includes(value);

export const toModuleList = (value: unknown): AppModule[] =>
  Array.isArray(value) ? value.filter(isAppModule) : [];

export const hasModuleAccess = (user: AuthUser, module: AppModule): boolean =>
  user.role === 'admin' ||
  user.role === 'manager' ||
  (user.role === 'user' && user.permissions.includes(module));

export const loadAuthUser = async (id: number): Promise<AuthUser | null> => {
  const result = await pool.query(
    'SELECT id, username, role, permissions FROM users WHERE id = $1',
    [id],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: isUserRole(row.role) ? row.role : 'customer',
    permissions: toModuleList(row.permissions),
  };
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  let id: number;
  try {
    ({ id } = jwt.verify(header.slice(7), jwtSecret()) as { id: number });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  try {
    const user = await loadAuthUser(id);
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: 'Authentication check failed' });
  }
};

export const requireInternalUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role !== 'customer') return next();
  res.status(403).json({ error: 'Not permitted' });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ error: 'Administrator access required' });
};

export const requireModuleForWrites =
  (module: AppModule) => (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') return next();
    if (req.user && hasModuleAccess(req.user, module)) return next();
    res.status(403).json({ error: `No permission to change ${module} data` });
  };
