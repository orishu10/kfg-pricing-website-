import type { AppModule, AppUser, UserPayload, UserRole } from '../../../api';
import {
  EMPTY_USER_FORM, MIN_PASSWORD_LENGTH, MODULE_OPTIONS, ROLE_OPTIONS, ROLES_WITH_FULL_ACCESS,
  type UserForm,
} from './consts';

export const userToForm = (user: AppUser | null): UserForm =>
  user
    ? {
        username: user.username,
        email: user.email ?? '',
        password: '',
        role: user.role,
        permissions: user.permissions,
      }
    : EMPTY_USER_FORM;

export const usesModulePermissions = (role: UserRole) => role === 'user';

export const formToPayload = (form: UserForm): UserPayload => ({
  username: form.username.trim(),
  email: form.email.trim() || null,
  role: form.role,
  permissions: usesModulePermissions(form.role) ? form.permissions : [],
  ...(form.password ? { password: form.password } : {}),
});

export const toggleModule = (permissions: AppModule[], module: AppModule): AppModule[] =>
  permissions.includes(module)
    ? permissions.filter((entry) => entry !== module)
    : [...permissions, module];

export const validateUserForm = (
  form: UserForm,
  isEdit: boolean,
): Partial<Record<keyof UserForm, string>> => {
  const errors: Partial<Record<keyof UserForm, string>> = {};
  if (!form.username.trim()) errors.username = 'Username is required';
  const email = form.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  if (!isEdit || form.password) {
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `At least ${MIN_PASSWORD_LENGTH} characters`;
    }
  }
  return errors;
};

export const permissionsLabel = (user: AppUser): string => {
  if (ROLES_WITH_FULL_ACCESS.includes(user.role)) return 'All modules';
  if (user.role === 'customer') return 'None';
  if (user.permissions.length === 0) return 'None';
  return MODULE_OPTIONS.filter((option) => user.permissions.includes(option.value))
    .map((option) => option.label)
    .join(', ');
};

export const roleLabel = (user: AppUser): string =>
  ROLE_OPTIONS.find((option) => option.value === user.role)?.label ?? user.role;
