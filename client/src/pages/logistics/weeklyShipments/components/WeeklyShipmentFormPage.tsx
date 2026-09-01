import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../../context/auth';
import { ErrorAlert, LoadingPage } from '../../../../components';
import { FormField, FormSelect, FormPanel, gridSx } from '../../components/form';
import { EMPTY_SHIPMENT, CONTAINER_OPTIONS, type ShipmentForm } from '../utils/consts';
import { shipmentToForm, formToInput } from '../utils/helpers';
import {
  getWeeklyShipment, createWeeklyShipment, updateWeeklyShipment,
} from '../../../../api';

export const WeeklyShipmentFormPage = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get('from');
  const isEdit = !!shipmentId;
  const sourceId = shipmentId ?? fromId ?? undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState<ShipmentForm>(EMPTY_SHIPMENT);

  const sourceQuery = useQuery({
    queryKey: ['weekly-shipment', sourceId],
    queryFn: () => getWeeklyShipment(sourceId!),
    enabled: !!sourceId,
  });

  const s = sourceQuery.data;
  const sig = sourceId ? (s ? `${isEdit ? 'edit' : 'dup'}:${s.id}:${s.updated_at ?? ''}` : null) : '__new__';
  const [synced, setSynced] = useState<string | null>(null);
  if (sig && sig !== synced) {
    setSynced(sig);
    setForm(s ? shipmentToForm(s) : EMPTY_SHIPMENT);
  }

  const set = (k: keyof ShipmentForm) => (v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const onError = (fallback: string) => (err: unknown) => {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(msg || fallback);
  };
  const done = () => {
    queryClient.invalidateQueries({ queryKey: ['weekly-shipments'] });
    navigate('/logistics/weekly-shipments');
  };

  const createMutation = useMutation({
    mutationFn: createWeeklyShipment,
    onSuccess: done,
    onError: onError('Failed to create shipment'),
  });
  const updateMutation = useMutation({
    mutationFn: (data: ReturnType<typeof formToInput>) => updateWeeklyShipment(shipmentId!, data),
    onSuccess: done,
    onError: onError('Failed to update shipment'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = { ...formToInput(form), created_by: username ?? '', updated_by: username ?? '' };
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (sourceId && sourceQuery.isLoading) return <LoadingPage />;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/logistics/weekly-shipments')} sx={{ textTransform: 'none' }}>
          Weekly Shipments
        </Button>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          {isEdit ? `Shipment ${shipmentId}` : 'New Shipment'}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}><ErrorAlert message={error} /></Box>

      <FormPanel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={gridSx(4)}>
            <FormSelect label="CON" value={form.con} onChange={set('con')} options={CONTAINER_OPTIONS} />
            <FormField label="Customer" value={form.customer} onChange={set('customer')} />
            <FormField label="Supplier" value={form.supplier} onChange={set('supplier')} />
            <FormField label="Description" value={form.description} onChange={set('description')} />
          </Box>
          <Box sx={gridSx(3)}>
            <FormField label="PUP" value={form.pup} onChange={set('pup')} />
            <FormField label="POL" value={form.pol} onChange={set('pol')} />
            <FormField label="POD" value={form.pod} onChange={set('pod')} />
          </Box>
          <Box sx={gridSx(2)}>
            <FormField label="Vessel" value={form.vessel} onChange={set('vessel')} />
            <FormField label="Voyage" value={form.voyage} onChange={set('voyage')} />
          </Box>
          <Box sx={gridSx(3)}>
            <FormField label="ETD" type="date" value={form.etd} onChange={set('etd')} />
            <FormField label="ETA" type="date" value={form.eta} onChange={set('eta')} />
            <FormControlLabel
              sx={{ alignSelf: 'end' }}
              control={
                <Checkbox
                  checked={form.booked === 'true'}
                  onChange={(e) => set('booked')(e.target.checked ? 'true' : '')}
                />
              }
              label="Booked"
            />
          </Box>
        </Box>
      </FormPanel>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/logistics/weekly-shipments')}>Cancel</Button>
        <Button type="submit" variant="contained" size="large">Save</Button>
      </Box>
    </Box>
  );
};

export default WeeklyShipmentFormPage;
