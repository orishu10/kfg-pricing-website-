import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { CommonInput, CommonSelect, ErrorAlert } from '../../../components';
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
  onClose: () => void;
  onSubmit: (payload: UserPayload) => void;
  onDelete?: () => void;
}

export const UserFormDialog = ({ open, initial, error, onClose, onSubmit, onDelete }: UserFormDialogProps) => {
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Edit ${initial.username}` : 'Add User'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <CommonInput
              label="Username"
              size="small"
              required
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
            <CommonSelect
              label="Role"
              size="small"
              required
              value={form.role}
              onChange={setRole}
              options={ROLE_OPTIONS}
              placeholder={null}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {ROLE_DESCRIPTIONS[form.role]}
            </Typography>
          </Box>

          {usesModulePermissions(form.role) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Module permissions
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                {MODULE_OPTIONS.map((module) => (
                  <FormControlLabel
                    key={module.value}
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
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <ErrorAlert message={error} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" sx={{ mr: 'auto' }}>
              Delete
            </Button>
          )}
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitted && hasErrors}>
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
