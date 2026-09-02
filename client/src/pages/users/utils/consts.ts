import type { AppModule, UserRole } from '../../../api';

export const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'User', value: 'user' },
  { label: 'Customer', value: 'customer' },
];

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full access to every module, plus creating and managing users.',
  manager: 'Full access to every module. Cannot manage users.',
  user: 'Access limited to the modules ticked below.',
  customer: 'No access to internal modules.',
};

export const MODULE_OPTIONS: { label: string; value: AppModule }[] = [
  { label: 'DBM', value: 'dbm' },
  { label: 'Pricing', value: 'pricing' },
  { label: 'Logistics', value: 'logistics' },
  { label: 'Reports', value: 'reports' },
];

export const ROLES_WITH_FULL_ACCESS: UserRole[] = ['admin', 'manager'];

export const MIN_PASSWORD_LENGTH = 8;

export interface UserForm {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: AppModule[];
}

export const EMPTY_USER_FORM: UserForm = {
  username: '',
  email: '',
  password: '',
  role: 'user',
  permissions: [],
};
