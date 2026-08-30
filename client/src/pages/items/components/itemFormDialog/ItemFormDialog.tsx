import { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { CommonInput, CommonSelect, ErrorAlert } from '../../../../components';
import type { Item, NewItem, Supplier } from '../../../../api';

interface ItemFormDialogProps {
  open: boolean;
  initial: Item | null;
  isEdit: boolean;
  suppliers: Supplier[];
  error: string;
  onClose: () => void;
  onSubmit: (data: NewItem) => void;
}

const EMPTY = {
  supplier_id: '', name: '', size: '', unit_weight: '', units_in_case: '', cases_in_fcl: '',
};

const num = (v: string) => (v.trim() === '' ? null : Number(v));

const FIELD_LABELS: Record<keyof typeof EMPTY, string> = {
  supplier_id: 'Supplier',
  name: 'Description',
  size: 'Size',
  unit_weight: 'Unit Weight',
  units_in_case: 'Units / Case',
  cases_in_fcl: 'Cases / FCL',
};
const NUMERIC_FIELDS: (keyof typeof EMPTY)[] = ['unit_weight', 'units_in_case', 'cases_in_fcl'];

const validate = (form: typeof EMPTY): Partial<Record<keyof typeof EMPTY, string>> => {
  const errors: Partial<Record<keyof typeof EMPTY, string>> = {};
  (Object.keys(FIELD_LABELS) as (keyof typeof EMPTY)[]).forEach((key) => {
    if (form[key].trim() === '') {
      errors[key] = `${FIELD_LABELS[key]} is required`;
    } else if (NUMERIC_FIELDS.includes(key)) {
      const n = Number(form[key]);
      if (Number.isNaN(n) || n < 0) errors[key] = 'Enter a valid number';
    }
  });
  return errors;
};

const toForm = (it: Item | null) =>
  it
    ? {
        supplier_id: it.supplier_id,
        name: it.name ?? '',
        size: it.size ?? '',
        unit_weight: it.unit_weight ?? '',
        units_in_case: it.units_in_case != null ? String(it.units_in_case) : '',
        cases_in_fcl: it.cases_in_fcl != null ? String(it.cases_in_fcl) : '',
      }
    : EMPTY;

export const ItemFormDialog = ({ open, initial, isEdit, suppliers, error, onClose, onSubmit }: ItemFormDialogProps) => {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const formKey = open ? `${isEdit ? 'edit' : 'new'}:${initial ? initial.id : '__blank__'}` : null;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  if (formKey !== activeKey) {
    setActiveKey(formKey);
    if (open) {
      setForm(toForm(initial));
      setSubmitted(false);
    }
  }

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;
  const errFor = (key: keyof typeof form) => (submitted ? errors[key] : undefined);

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;
    onSubmit({
      supplier_id: form.supplier_id,
      name: form.name.trim(),
      size: form.size.trim() || null,
      unit_weight: num(form.unit_weight),
      units_in_case: num(form.units_in_case),
      cases_in_fcl: num(form.cases_in_fcl),
    });
  };

  const supplierOptions = suppliers.map((s) => ({ label: s.name, value: s.id }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? `Edit Item ${initial?.id}` : initial ? 'Duplicate Item' : 'Add Item'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <CommonSelect
              label="Supplier"
              size="small"
              required
              value={form.supplier_id}
              onChange={set('supplier_id')}
              options={supplierOptions}
              error={!!errFor('supplier_id')}
              helperText={errFor('supplier_id')}
            />
            <CommonInput label="Description" size="small" required value={form.name} onChange={set('name')} error={!!errFor('name')} helperText={errFor('name')} />
            <CommonInput label="Size" size="small" required value={form.size} onChange={set('size')} placeholder="e.g. 12/800gr" error={!!errFor('size')} helperText={errFor('size')} />
            <CommonInput label="Unit Weight" size="small" required type="number" value={form.unit_weight} onChange={set('unit_weight')} error={!!errFor('unit_weight')} helperText={errFor('unit_weight')} />
            <CommonInput label="Units / Case" size="small" required type="number" value={form.units_in_case} onChange={set('units_in_case')} error={!!errFor('units_in_case')} helperText={errFor('units_in_case')} />
            <CommonInput label="Cases / FCL" size="small" required type="number" value={form.cases_in_fcl} onChange={set('cases_in_fcl')} error={!!errFor('cases_in_fcl')} helperText={errFor('cases_in_fcl')} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <ErrorAlert message={error} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
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
