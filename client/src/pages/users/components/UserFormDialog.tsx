import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { AppDialog, CommonInput, CommonSelect, FormSection } from '../../../components';
import { changedFieldCount, initials } from '../../../utils/forms';
import { formatDate } from '../../../utils/time';
import {
  EMPTY_USER_FORM, MODULE_OPTIONS, ROLE_DESCRIPTIONS, ROLE_OPTIONS, type UserForm,
} from '../utils/consts';
import {
  formToPayload, toggleModule, userToForm, usesModulePermissions, validateUserForm,
} from '../utils/helpers';
import type { AppUser, UserPayload, UserRole } from '../../../api';

interface UserFormDialogProps {
  open: boolean;
  initial: AppUser | null;
  error: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: UserPayload) => void;
  onDelete?: () => void;
}

export const UserFormDialog = ({ open, initial, error, saving, onClose, onSubmit, onDelete }: UserFormDialogProps) => {
  const [form, setForm] = useState<UserForm>(EMPTY_USER_FORM);
  const [submitted, setSubmitted] = useState(false);
  const isEdit = initial !== null;

  const formKey = open ? (initial ? String(initial.id) : '__new__') : null;
  const [loadedFormKey, setLoadedFormKey] = useState<string | null>(null);
  if (formKey !== loadedFormKey) {
    setLoadedFormKey(formKey);
    if (open) {
      setForm(userToForm(initial));
      setSubmitted(false);
    }
  }

  const errors = validateUserForm(form, isEdit);
  const hasErrors = Object.keys(errors).length > 0;
  const errorFor = (key: keyof UserForm) => (submitted ? errors[key] : undefined);
  const changedCount = changedFieldCount(form, userToForm(initial));

  const set = (key: keyof UserForm) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const setRole = (value: string) =>
    setForm((previous) => ({ ...previous, role: value as UserRole }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;
    onSubmit(formToPayload(form));
  };

  const subtitle = isEdit
    ? [initial.email, initial.created_at ? `created ${formatDate(initial.created_at)}` : ''].filter(Boolean).join(' · ')
    : 'New user';

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEdit ? `Edit ${initial.username}` : 'Add User'}
      subtitle={subtitle}
      avatar={initials(form.username, 'U')}
      error={error}
      saving={saving}
      changedCount={changedCount}
      submitDisabled={submitted && hasErrors}
      footerStart={
        isEdit && onDelete ? (
          <Button onClick={onDelete} color="error" startIcon={<DeleteOutlineIcon />} disabled={saving}>
            Delete
          </Button>
        ) : undefined
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormSection label="Account">
          <CommonInput
            label="Username"
            size="small"
            required
            autoFocus={!isEdit}
            value={form.username}
            onChange={set('username')}
            error={!!errorFor('username')}
            helperText={errorFor('username')}
          />
          <CommonInput
            label="Email"
            size="small"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={!!errorFor('email')}
            helperText={errorFor('email')}
          />
          <CommonInput
            label={isEdit ? 'New Password' : 'Password'}
            size="small"
            type="password"
            required={!isEdit}
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={!!errorFor('password')}
            helperText={errorFor('password') ?? (isEdit ? 'Leave blank to keep current' : undefined)}
          />
        </FormSection>

        <FormSection label="Role">
          <CommonSelect
            label="Role"
            size="small"
            required
            value={form.role}
            onChange={setRole}
            options={ROLE_OPTIONS}
            placeholder={null}
          />
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
            {ROLE_DESCRIPTIONS[form.role]}
          </Typography>
        </FormSection>

        {usesModulePermissions(form.role) && (
          <FormSection label="Module permissions">
            {MODULE_OPTIONS.map((module) => (
              <FormControlLabel
                key={module.value}
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    checked={form.permissions.includes(module.value)}
                    onChange={() =>
                      setForm((previous) => ({
                        ...previous,
                        permissions: toggleModule(previous.permissions, module.value),
                      }))
                    }
                  />
                }
                label={module.label}
              />
            ))}
          </FormSection>
        )}
      </Box>
    </AppDialog>
  );
};
