import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { CommonInput } from '../commonInput/CommonInput';
import { ErrorAlert } from '../errorAlert/ErrorAlert';
import type { Customer, PartyPayload, Supplier } from '../../api';

const CURRENCY_OPTIONS = ['USD', 'EUR', 'ILS'];

interface PartyFormDialogProps {
  open: boolean;
  entity: string;
  initial: Customer | Supplier | null;
  error: string;
  onClose: () => void;
  onSubmit: (id: string, payload: PartyPayload) => void;
  onDelete?: () => void;
}

const EMPTY = {
  id: '', name: '', short_name: '', phone: '', incoterms: '', currency: '',
  address: '', city: '', zip_code: '', country: '',
};

const toForm = (initial: Customer | Supplier | null) =>
  initial
    ? {
        id: initial.id,
        name: initial.name ?? '',
        short_name: initial.short_name ?? '',
        phone: initial.phone ?? '',
        incoterms: initial.incoterms ?? '',
        currency: (initial as Customer).currency ?? '',
        address: initial.address ?? '',
        city: initial.city ?? '',
        zip_code: initial.zip_code ?? '',
        country: initial.country ?? '',
      }
    : EMPTY;

export const PartyFormDialog = ({ open, entity, initial, error, onClose, onSubmit, onDelete }: PartyFormDialogProps) => {
  const [form, setForm] = useState(EMPTY);
  const isEdit = initial !== null;

  const formKey = open ? (initial ? initial.id : '__new__') : null;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  if (formKey !== activeKey) {
    setActiveKey(formKey);
    if (open) setForm(toForm(initial));
  }

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const isCustomer = entity === 'Customer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { id, name, short_name, phone, incoterms, currency, address, city, zip_code, country } = form;
    onSubmit(id.trim(), {
      name: name.trim(),
      short_name: short_name.trim() || null,
      phone: phone.trim() || null,
      incoterms: incoterms.trim() || null,
      ...(isCustomer ? { currency: currency.trim() || null } : {}),
      address: address.trim() || null,
      city: city.trim() || null,
      zip_code: zip_code.trim() || null,
      country: country.trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Edit ${entity}` : `Add ${entity}`}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <CommonInput
              label={`${entity} ID`}
              size="small"
              required
              value={form.id}
              onChange={set('id')}
              disabled={isEdit}
              placeholder="e.g. 001"
            />
            <CommonInput label="Full Name" size="small" required value={form.name} onChange={set('name')} />
            <CommonInput label="Short Name" size="small" value={form.short_name} onChange={set('short_name')} />
            <CommonInput label="Phone" size="small" value={form.phone} onChange={set('phone')} />
            <CommonInput label="Incoterms" size="small" value={form.incoterms} onChange={set('incoterms')} />
            {isCustomer && (
              <TextField
                select
                label="Currency"
                size="small"
                fullWidth
                value={form.currency}
                onChange={(e) => set('currency')(e.target.value)}
              >
                <MenuItem value=""><em>—</em></MenuItem>
                {CURRENCY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            )}
            <CommonInput label="Address" size="small" value={form.address} onChange={set('address')} />
            <CommonInput label="City" size="small" value={form.city} onChange={set('city')} />
            <CommonInput label="ZIP Code" size="small" value={form.zip_code} onChange={set('zip_code')} />
            <CommonInput label="Country" size="small" value={form.country} onChange={set('country')} />
          </Box>
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
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
