import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { AppDialog } from '../appDialog/AppDialog';
import { CommonInput } from '../commonInput/CommonInput';
import { CommonSelect } from '../commonSelect/CommonSelect';
import { FormSection } from '../formSection/FormSection';
import { SegmentedControl } from '../segmentedControl/SegmentedControl';
import { useLookups } from '../../hooks/useLookups';
import { changedFieldCount, initials, PHONE_PATTERN } from '../../utils/forms';
import { formatDate } from '../../utils/time';
import type { Customer, PartyPayload, Supplier } from '../../api';

const CURRENCY_OPTIONS = ['ILS', 'USD', 'EUR'];

interface PartyFormDialogProps {
  open: boolean;
  entity: string;
  initial: Customer | Supplier | null;
  error: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (id: string, payload: PartyPayload) => void;
  onDelete?: () => void;
}

const EMPTY = {
  id: '', name: '', short_name: '', phone: '', incoterms: '', currency: '',
  payment_terms: '', address: '', city: '', zip_code: '', country: '',
};

const toForm = (initial: Customer | Supplier | null) =>
  initial
    ? {
        id: initial.id,
        name: initial.name ?? '',
        short_name: initial.short_name ?? '',
        phone: initial.phone ?? '',
        incoterms: initial.incoterms ?? '',
        currency: initial.currency ?? '',
        payment_terms: initial.payment_terms ?? '',
        address: initial.address ?? '',
        city: initial.city ?? '',
        zip_code: initial.zip_code ?? '',
        country: initial.country ?? '',
      }
    : EMPTY;

export const PartyFormDialog = ({
  open, entity, initial, error, saving, onClose, onSubmit, onDelete,
}: PartyFormDialogProps) => {
  const { options } = useLookups();
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const isEdit = initial !== null;

  const formKey = open ? (initial ? initial.id : '__new__') : null;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  if (formKey !== activeKey) {
    setActiveKey(formKey);
    if (open) {
      setForm(toForm(initial));
      setSubmitted(false);
    }
  }

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const phoneInvalid = !PHONE_PATTERN.test(form.phone);
  const nameMissing = form.name.trim() === '';
  const idMissing = !isEdit && form.id.trim() === '';
  const hasErrors = phoneInvalid || nameMissing || idMissing;
  const changedCount = changedFieldCount(form, toForm(initial));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;
    const {
      id, name, short_name, phone, incoterms, currency, payment_terms,
      address, city, zip_code, country,
    } = form;
    onSubmit(id.trim(), {
      name: name.trim(),
      short_name: short_name.trim() || null,
      phone: phone.trim() || null,
      incoterms: incoterms.trim() || null,
      currency: currency.trim() || null,
      payment_terms: payment_terms.trim() || null,
      address: address.trim() || null,
      city: city.trim() || null,
      zip_code: zip_code.trim() || null,
      country: country.trim() || null,
    });
  };

  const subtitle = isEdit
    ? [`ID ${initial.id}`, initial.name, initial.created_at ? `created ${formatDate(initial.created_at)}` : '']
        .filter(Boolean)
        .join(' · ')
    : `New ${entity.toLowerCase()}`;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEdit ? `Edit ${entity}` : `Add ${entity}`}
      subtitle={subtitle}
      avatar={initials(form.name, entity[0])}
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
        <FormSection label="Identity">
          {isEdit ? (
            <TextField
              label={`${entity} ID`}
              size="small"
              value={form.id}
              disabled
              helperText="Locked after creation"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <LockOutlinedIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <CommonInput
              label={`${entity} ID`}
              size="small"
              required
              autoFocus
              value={form.id}
              onChange={set('id')}
              placeholder="e.g. 001"
              error={submitted && idMissing}
              helperText={submitted && idMissing ? `${entity} ID is required` : undefined}
            />
          )}
          <CommonInput
            label="Full Name"
            size="small"
            required
            value={form.name}
            onChange={set('name')}
            error={submitted && nameMissing}
            helperText={submitted && nameMissing ? 'Full name is required' : undefined}
          />
          <CommonInput label={entity} size="small" value={form.short_name} onChange={set('short_name')} />
        </FormSection>

        <FormSection label="Address">
          <CommonInput label="Address" size="small" value={form.address} onChange={set('address')} />
          <CommonInput label="ZIP Code" size="small" value={form.zip_code} onChange={set('zip_code')} />
          <CommonInput label="City" size="small" value={form.city} onChange={set('city')} />
          <CommonSelect
            label="Country"
            size="small"
            searchable
            value={form.country}
            onChange={set('country')}
            options={options('country', form.country)}
          />
        </FormSection>

        <FormSection label="Contact & Terms">
          <CommonInput
            label="Phone"
            size="small"
            value={form.phone}
            onChange={set('phone')}
            error={phoneInvalid}
            helperText={phoneInvalid ? 'Digits, spaces, + ( ) - only' : undefined}
          />
          <CommonSelect
            label="Incoterms"
            size="small"
            value={form.incoterms}
            onChange={set('incoterms')}
            options={options('incoterms', form.incoterms)}
          />
          <SegmentedControl
            label="Currency"
            size="medium"
            value={form.currency}
            onChange={set('currency')}
            options={CURRENCY_OPTIONS}
          />
          <Box sx={{ alignSelf: 'end' }}>
            <CommonSelect
              label="Payment Terms"
              size="small"
              value={form.payment_terms}
              onChange={set('payment_terms')}
              options={options('payment_terms', form.payment_terms)}
            />
          </Box>
        </FormSection>
      </Box>
    </AppDialog>
  );
};
