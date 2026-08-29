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
  /** Existing item to edit, or null to add a new one */
  initial: Item | null;
  suppliers: Supplier[];
  error: string;
  onClose: () => void;
  onSubmit: (data: NewItem) => void;
}

const EMPTY = {
  supplier_id: '', name: '', size: '', unit_weight: '', units_in_case: '', cases_in_fcl: '',
};

const num = (v: string) => (v.trim() === '' ? null : Number(v));

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

export const ItemFormDialog = ({ open, initial, suppliers, error, onClose, onSubmit }: ItemFormDialogProps) => {
  const [form, setForm] = useState(EMPTY);
  const isEdit = initial !== null;

  // Reset when the dialog opens or switches which item it edits.
  const formKey = open ? (initial ? initial.id : '__new__') : null;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  if (formKey !== activeKey) {
    setActiveKey(formKey);
    if (open) setForm(toForm(initial));
  }

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <DialogTitle>{isEdit ? `Edit Item ${initial?.id}` : 'Add Item'}</DialogTitle>
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
            />
            <CommonInput label="Description" size="small" required value={form.name} onChange={set('name')} />
            <CommonInput label="Size" size="small" value={form.size} onChange={set('size')} placeholder="e.g. 12/800gr" />
            <CommonInput label="Unit Weight" size="small" type="number" value={form.unit_weight} onChange={set('unit_weight')} />
            <CommonInput label="Units / Case" size="small" type="number" value={form.units_in_case} onChange={set('units_in_case')} />
            <CommonInput label="Cases / FCL" size="small" type="number" value={form.cases_in_fcl} onChange={set('cases_in_fcl')} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <ErrorAlert message={error} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!form.supplier_id || !form.name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
