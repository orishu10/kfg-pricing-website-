import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useAuth } from '../../../context/auth';
import { ErrorAlert } from '../../../components';
import { pricingToForm, derivePricing } from '../utils/helpers';
import { printDocuments } from '../../../utils/print';
import { buildPricingSheetHtml } from '../utils/pricingSheet';
import { updatePricing, type Pricing } from '../../../api';

interface PricingBulkActionsProps {
  rows: Pricing[];
  onDone: () => void;
}

type Field = 'ex_rate' | 'us_tariff_pct';
const FIELD_META: Record<Field, { title: string; button: string; unit?: string }> = {
  ex_rate: { title: 'Update Ex Rate', button: 'Update Ex Rate' },
  us_tariff_pct: { title: 'Update US Tariff %', button: 'Update Tariff %', unit: '%' },
};

export const PricingBulkActions = ({ rows, onDone }: PricingBulkActionsProps) => {
  const { username } = useAuth();
  const queryClient = useQueryClient();
  const [field, setField] = useState<Field | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const close = () => { setField(null); setValue(''); setError(''); };

  const applyMutation = useMutation({
    mutationFn: async ({ f, v }: { f: Field; v: string }) => {
      for (const row of rows) {
        const form = { ...pricingToForm(row), [f]: v };
        const payload = { ...form, ...derivePricing(form), updated_by: username ?? '' };
        await updatePricing(row.id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      close();
      onDone();
    },
    onError: () => setError('Some rows failed to update. Please try again.'),
  });

  const open = (f: Field) => { setField(f); setValue(''); setError(''); };

  const saveAsPdf = () => printDocuments(rows.map(buildPricingSheetHtml));

  return (
    <>
      <Button size="small" variant="outlined" onClick={() => open('ex_rate')}>
        {FIELD_META.ex_rate.button}
      </Button>
      <Button size="small" variant="outlined" onClick={() => open('us_tariff_pct')}>
        {FIELD_META.us_tariff_pct.button}
      </Button>
      <Button size="small" variant="outlined" onClick={saveAsPdf}>
        Save as PDF
      </Button>

      <Dialog open={field !== null} onClose={applyMutation.isPending ? undefined : close} maxWidth="xs" fullWidth>
        <DialogTitle>{field ? FIELD_META[field].title : ''}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="New value"
              type="number"
              size="small"
              fullWidth
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              slotProps={
                field && FIELD_META[field].unit
                  ? { input: { endAdornment: <InputAdornment position="end">{FIELD_META[field].unit}</InputAdornment> } }
                  : undefined
              }
            />
            <Box sx={{ mt: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
              Applies to {rows.length} selected record{rows.length === 1 ? '' : 's'}.
            </Box>
            <Box sx={{ mt: 1 }}><ErrorAlert message={error} /></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close} variant="outlined" disabled={applyMutation.isPending}>Cancel</Button>
          <Button
            variant="contained"
            disabled={value.trim() === '' || applyMutation.isPending}
            onClick={() => field && applyMutation.mutate({ f: field, v: value })}
          >
            {applyMutation.isPending ? 'Applying…' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
