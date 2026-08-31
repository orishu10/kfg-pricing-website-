import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../../context/auth';
import { ErrorAlert, LoadingPage } from '../../../../components';
import { EMPTY_SHIPMENT, CONTAINER_OPTIONS, type ShipmentForm } from '../utils/consts';
import { shipmentToForm, formToInput } from '../utils/helpers';
import {
  getWeeklyShipment, createWeeklyShipment, updateWeeklyShipment,
} from '../../../../api';

const LABEL_SX = { fontSize: '0.66rem', fontWeight: 700, color: '#3a3a3a', mb: 0.25 } as const;
const INPUT_SX = { bgcolor: '#fff', '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.75 } } as const;

const gridSx = (cols: number) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1.25 });

const Fld = ({ label, value, onChange, type }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={LABEL_SX}>{label}</Typography>
    <TextField
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      slotProps={{ input: { sx: INPUT_SX } }}
    />
  </Box>
);

const Sel = ({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={LABEL_SX}>{label}</Typography>
    <Select value={value} onChange={(e) => onChange(e.target.value)} size="small" fullWidth displayEmpty sx={INPUT_SX}>
      <MenuItem value=""><em>—</em></MenuItem>
      {options.map((op) => (
        <MenuItem key={op} value={op}>{op}</MenuItem>
      ))}
    </Select>
  </Box>
);

const Panel = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.18)', borderRadius: 1.5, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    {children}
  </Box>
);

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

      <Panel>
        <Box sx={gridSx(4)}>
          <Sel label="CON" value={form.con} onChange={set('con')} options={CONTAINER_OPTIONS} />
          <Fld label="Customer" value={form.customer} onChange={set('customer')} />
          <Fld label="Supplier" value={form.supplier} onChange={set('supplier')} />
          <Fld label="Description" value={form.description} onChange={set('description')} />
        </Box>
        <Box sx={gridSx(3)}>
          <Fld label="PUP" value={form.pup} onChange={set('pup')} />
          <Fld label="POL" value={form.pol} onChange={set('pol')} />
          <Fld label="POD" value={form.pod} onChange={set('pod')} />
        </Box>
        <Box sx={gridSx(2)}>
          <Fld label="Vessel" value={form.vessel} onChange={set('vessel')} />
          <Fld label="Voyage" value={form.voyage} onChange={set('voyage')} />
        </Box>
        <Box sx={gridSx(3)}>
          <Fld label="ETD" type="date" value={form.etd} onChange={set('etd')} />
          <Fld label="ETA" type="date" value={form.eta} onChange={set('eta')} />
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
      </Panel>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/logistics/weekly-shipments')}>Cancel</Button>
        <Button type="submit" variant="contained" size="large">Save</Button>
      </Box>
    </Box>
  );
};

export default WeeklyShipmentFormPage;
