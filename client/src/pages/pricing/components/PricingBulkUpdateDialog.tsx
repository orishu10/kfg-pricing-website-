import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../../context/auth';
import { AppDialog, CommonInput, useToast } from '../../../components';
import { formatNumber } from '../../../utils/format';
import { pricingToForm, derivePricing, pricingLabel } from '../utils/helpers';
import { BULK_FIELD_META, BULK_PREVIEW_LIMIT, type BulkField } from '../utils/consts';
import { updatePricing, type Pricing } from '../../../api';

interface PricingBulkUpdateDialogProps {
  field: BulkField | null;
  rows: Pricing[];
  onClose: () => void;
  onDone: () => void;
}

export const PricingBulkUpdateDialog = ({ field, rows, onClose, onDone }: PricingBulkUpdateDialogProps) => {
  const { username } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const dialogKey = field ? `${field}:${rows.map((row) => row.id).join(',')}` : null;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  if (dialogKey !== loadedKey) {
    setLoadedKey(dialogKey);
    setValue('');
    setError('');
  }

  const applyMutation = useMutation({
    mutationFn: async ({ target, nextValue }: { target: BulkField; nextValue: string }) => {
      for (const row of rows) {
        const form = { ...pricingToForm(row), [target]: nextValue };
        const payload = { ...form, ...derivePricing(form), updated_by: username ?? '' };
        await updatePricing(row.id, payload);
      }
    },
    onSuccess: (_, { target }) => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      showToast({
        title: `${BULK_FIELD_META[target].title.replace('Update ', '')} updated`,
        description: `${rows.length} pricing record${rows.length === 1 ? '' : 's'} recalculated`,
      });
      onDone();
      onClose();
    },
    onError: () => setError('Some rows failed to update. Please try again.'),
  });

  const meta = field ? BULK_FIELD_META[field] : null;
  const preview = rows.slice(0, BULK_PREVIEW_LIMIT);
  const hidden = rows.length - preview.length;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!field || value.trim() === '') return;
    applyMutation.mutate({ target: field, nextValue: value.trim() });
  };

  return (
    <AppDialog
      open={field !== null}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={meta?.title ?? ''}
      subtitle={`Applies to ${rows.length} selected record${rows.length === 1 ? '' : 's'}`}
      maxWidth="xs"
      error={error}
      saving={applyMutation.isPending}
      submitLabel={`Apply to ${rows.length}`}
      submitDisabled={value.trim() === ''}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CommonInput
          label="New value"
          type="number"
          size="small"
          autoFocus
          value={value}
          onChange={setValue}
          placeholder={meta?.unit ? `e.g. 10${meta.unit}` : 'e.g. 3.72'}
        />
        <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1 }}>
          {preview.map((row, index) => (
            <Box
              key={row.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                px: 1.5,
                py: 0.75,
                fontSize: '0.8rem',
                borderBottom: index < preview.length - 1 || hidden > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700 }} noWrap>
                {pricingLabel(row)}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled', whiteSpace: 'nowrap' }}>
                {formatNumber(field ? row[field] : '') || '—'}
                {' → '}
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                  {value.trim() ? `${formatNumber(value.trim())}${meta?.unit ?? ''}` : '…'}
                </Box>
              </Typography>
            </Box>
          ))}
          {hidden > 0 && (
            <Typography sx={{ px: 1.5, py: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}>
              and {hidden} more
            </Typography>
          )}
        </Box>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
          Totals are recalculated for each row when applied.
        </Typography>
      </Box>
    </AppDialog>
  );
};
