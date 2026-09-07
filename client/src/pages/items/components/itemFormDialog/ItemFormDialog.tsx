import { useState } from 'react';
import Box from '@mui/material/Box';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { AppDialog, CommonInput, CommonSelect, FormSection } from '../../../../components';
import { changedFieldCount } from '../../../../utils/forms';
import { partyLabel } from '../../../../utils/format';
import type { Item, NewItem, Supplier } from '../../../../api';

interface ItemFormDialogProps {
  open: boolean;
  initial: Item | null;
  isEdit: boolean;
  suppliers: Supplier[];
  error: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: NewItem) => void;
}

const EMPTY = {
  supplier_id: '', name: '', size: '', unit_weight: '', units_in_case: '', cases_per_pallet: '', cases_in_fcl: '',
};

type ItemForm = typeof EMPTY;

const num = (v: string) => (v.trim() === '' ? null : Number(v));

const FIELD_LABELS: Record<keyof ItemForm, string> = {
  supplier_id: 'Supplier',
  name: 'Description',
  size: 'Size',
  unit_weight: 'Unit Weight',
  units_in_case: 'Units / Case',
  cases_per_pallet: 'Cases / Pallet',
  cases_in_fcl: 'Cases / FCL',
};
const NUMERIC_FIELDS: (keyof ItemForm)[] = ['unit_weight', 'units_in_case', 'cases_per_pallet', 'cases_in_fcl'];

const validate = (form: ItemForm): Partial<Record<keyof ItemForm, string>> => {
  const errors: Partial<Record<keyof ItemForm, string>> = {};
  (Object.keys(FIELD_LABELS) as (keyof ItemForm)[]).forEach((key) => {
    if (form[key].trim() === '') {
      errors[key] = `${FIELD_LABELS[key]} is required`;
    } else if (NUMERIC_FIELDS.includes(key)) {
      const n = Number(form[key]);
      if (Number.isNaN(n) || n < 0) errors[key] = 'Enter a valid number';
    }
  });
  return errors;
};

const toForm = (it: Item | null): ItemForm =>
  it
    ? {
        supplier_id: it.supplier_id,
        name: it.name ?? '',
        size: it.size ?? '',
        unit_weight: it.unit_weight ?? '',
        units_in_case: it.units_in_case != null ? String(it.units_in_case) : '',
        cases_per_pallet: it.cases_per_pallet != null ? String(it.cases_per_pallet) : '',
        cases_in_fcl: it.cases_in_fcl != null ? String(it.cases_in_fcl) : '',
      }
    : EMPTY;

export const ItemFormDialog = ({
  open, initial, isEdit, suppliers, error, saving, onClose, onSubmit,
}: ItemFormDialogProps) => {
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
  const errFor = (key: keyof ItemForm) => (submitted ? errors[key] : undefined);
  const changedCount = changedFieldCount(form, isEdit ? toForm(initial) : EMPTY);

  const set = (key: keyof ItemForm) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

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
      cases_per_pallet: num(form.cases_per_pallet),
      cases_in_fcl: num(form.cases_in_fcl),
    });
  };

  const supplierOptions = suppliers.map((s) => ({ label: partyLabel(s.short_name, s.name), value: s.id }));
  const supplierName = suppliers.find((s) => s.id === form.supplier_id);

  const title = isEdit ? 'Edit Item' : initial ? 'Duplicate Item' : 'Add Item';
  const subtitle = isEdit && initial
    ? [`#${initial.id}`, partyLabel(initial.supplier_short_name, initial.supplier_name)].filter(Boolean).join(' · ')
    : initial
      ? `Copy of #${initial.id}`
      : supplierName
        ? partyLabel(supplierName.short_name, supplierName.name)
        : 'New item';

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title}
      subtitle={subtitle}
      avatar={<Inventory2OutlinedIcon />}
      error={error}
      saving={saving}
      changedCount={changedCount}
      submitDisabled={submitted && hasErrors}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormSection label="Item">
          <CommonSelect
            label="Supplier"
            size="small"
            required
            searchable
            value={form.supplier_id}
            onChange={set('supplier_id')}
            options={supplierOptions}
            error={!!errFor('supplier_id')}
            helperText={errFor('supplier_id')}
          />
          <CommonInput
            label="Size"
            size="small"
            required
            value={form.size}
            onChange={set('size')}
            placeholder="e.g. 12/800gr"
            error={!!errFor('size')}
            helperText={errFor('size')}
          />
          <Box sx={{ gridColumn: { sm: 'span 2' } }}>
            <CommonInput
              label="Description"
              size="small"
              required
              value={form.name}
              onChange={set('name')}
              error={!!errFor('name')}
              helperText={errFor('name')}
            />
          </Box>
        </FormSection>

        <FormSection label="Packaging">
          <CommonInput label="Unit Weight" size="small" required type="number" value={form.unit_weight} onChange={set('unit_weight')} error={!!errFor('unit_weight')} helperText={errFor('unit_weight')} />
          <CommonInput label="Units / Case" size="small" required type="number" value={form.units_in_case} onChange={set('units_in_case')} error={!!errFor('units_in_case')} helperText={errFor('units_in_case')} />
          <CommonInput label="Cases / Pallet" size="small" required type="number" value={form.cases_per_pallet} onChange={set('cases_per_pallet')} error={!!errFor('cases_per_pallet')} helperText={errFor('cases_per_pallet')} />
          <CommonInput label="Cases / FCL" size="small" required type="number" value={form.cases_in_fcl} onChange={set('cases_in_fcl')} error={!!errFor('cases_in_fcl')} helperText={errFor('cases_in_fcl')} />
        </FormSection>
      </Box>
    </AppDialog>
  );
};
