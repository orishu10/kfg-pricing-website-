export const STORAGE_KEYS = {
  token: 'kfg_token',
  username: 'kfg_username',
  role: 'kfg_role',
  permissions: 'kfg_permissions',
} as const;

export const USER_ROLES = ['admin', 'manager', 'user', 'customer'] as const;

export const APP_MODULES = ['dbm', 'pricing', 'logistics', 'reports'] as const;
