import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../../context/auth';
import { ErrorAlert, LoadingPage } from '../../../../components';
import {
  EMPTY_ROUTE, CURRENCY_OPTIONS, CONTAINER_OPTIONS, INCOTERMS,
  SHIPPING_LINE_OPTIONS, POL_OPTIONS, POD_OPTIONS, type RouteForm,
} from '../utils/consts';
import { deriveRoute, routeToForm } from '../utils/helpers';
import {
  getRoute, createRoute, updateRoute, type RouteInput,
} from '../../../../api';

type Opt = string | { label: string; value: string };

const C = {
  log: '#e9e4f2', green: '#e6efe1', pink: '#f6e2e2', blue: '#dcecf4',
  grey: '#e6e6e6', tariff: '#e7dbf1', yellow: '#f6efc0',
};

const LABEL_SX = { fontSize: '0.66rem', fontWeight: 700, color: '#3a3a3a', mb: 0.25 } as const;
const INPUT_SX = { bgcolor: '#fff', '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.75 } } as const;

const gridSx = (cols: number, gap = 1.25) => ({
  display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap,
});

const FieldLabel = ({ label }: { label?: string }) =>
  label ? <Typography sx={LABEL_SX}>{label}</Typography> : null;

const Fld = ({ label, value, onChange, readOnly, unit, type }: {
  label?: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; unit?: string; type?: string;
}) => (
  <Box sx={{ minWidth: 0 }}>
    <FieldLabel label={label} />
    <TextField
      value={value}
      type={type}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      size="small"
      fullWidth
      slotProps={{
        input: {
          readOnly,
          sx: { ...INPUT_SX, bgcolor: readOnly ? 'rgba(0,0,0,0.05)' : '#fff' },
          endAdornment: unit ? (
            <InputAdornment position="end" sx={{ '& p': { fontSize: '0.75rem' } }}>{unit}</InputAdornment>
          ) : undefined,
        },
      }}
    />
  </Box>
);

const Sel = ({ label, value, onChange, options }: {
  label?: string; value: string; onChange: (v: string) => void; options: Opt[];
}) => (
  <Box sx={{ minWidth: 0 }}>
    <FieldLabel label={label} />
    <Select value={value} onChange={(e) => onChange(e.target.value)} size="small" fullWidth displayEmpty sx={INPUT_SX}>
      <MenuItem value=""><em>—</em></MenuItem>
      {options.map((op) =>
        typeof op === 'string' ? (
          <MenuItem key={op} value={op}>{op}</MenuItem>
        ) : (
          <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
        ),
      )}
    </Select>
  </Box>
);

const Panel = ({ label, color, children }: {
  label?: string; color?: string; children: React.ReactNode;
}) => (
  <Box
    sx={{
      position: 'relative', bgcolor: color ?? '#fff', border: '1px solid rgba(0,0,0,0.18)',
      borderRadius: 1.5, pt: label ? 2.4 : 1.5, px: 1.5, pb: 1.5,
    }}
  >
    {label && (
      <Box
        sx={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          bgcolor: '#efefef', border: '1px solid rgba(0,0,0,0.18)', borderRadius: 5, px: 1.2, py: 0.15,
        }}
      >
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.6, color: '#555', whiteSpace: 'nowrap' }}>
          {label}
        </Typography>
      </Box>
    )}
    {children}
  </Box>
);

const PRICE_COLORS: Record<string, string> = { fob: C.green, cif: C.blue, dap: C.pink, ddp: C.yellow };

export const RouteFormPage = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get('from');
  const isEdit = !!routeId;
  const sourceId = routeId ?? fromId ?? undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState<RouteForm>(EMPTY_ROUTE);

  const sourceQuery = useQuery({
    queryKey: ['route', sourceId],
    queryFn: () => getRoute(sourceId!),
    enabled: !!sourceId,
  });

  const r = sourceQuery.data;
  const sig = sourceId
    ? r ? `${isEdit ? 'edit' : 'dup'}:${r.id}:${r.updated_at ?? ''}` : null
    : '__new__';
  const [synced, setSynced] = useState<string | null>(null);
  if (sig && sig !== synced) {
    setSynced(sig);
    setForm(r ? routeToForm(r) : EMPTY_ROUTE);
  }

  const set = (k: keyof RouteForm) => (v: string) =>
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      return { ...next, ...deriveRoute(next) };
    });

  const onError = (fallback: string) => (err: unknown) => {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(msg || fallback);
  };
  const done = () => {
    queryClient.invalidateQueries({ queryKey: ['routes'] });
    navigate('/logistics/routes');
  };

  const createMutation = useMutation({
    mutationFn: (data: RouteInput) => createRoute(data),
    onSuccess: done,
    onError: onError('Failed to create route'),
  });
  const updateMutation = useMutation({
    mutationFn: (data: RouteInput) => updateRoute(routeId!, data),
    onSuccess: done,
    onError: onError('Failed to update route'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload: RouteInput = { ...form, created_by: username ?? '', updated_by: username ?? '' };
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (sourceId && sourceQuery.isLoading) return <LoadingPage />;

  const priceBox = (x: (typeof INCOTERMS)[number]) => {
    const cur = form[`${x}_currency` as keyof RouteForm] || 'ILS';
    return (
      <Panel key={x} label={x.toUpperCase()} color={PRICE_COLORS[x]}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Sel
            label="Currency"
            value={form[`${x}_currency` as keyof RouteForm]}
            onChange={set(`${x}_currency` as keyof RouteForm)}
            options={CURRENCY_OPTIONS}
          />
          <Fld
            label="ILS"
            value={form[`${x}_ils` as keyof RouteForm]}
            onChange={set(`${x}_ils` as keyof RouteForm)}
            readOnly={cur !== 'ILS'}
            unit="₪"
          />
          <Fld
            label="USD"
            value={form[`${x}_usd` as keyof RouteForm]}
            onChange={set(`${x}_usd` as keyof RouteForm)}
            readOnly={cur !== 'USD'}
            unit="$"
          />
          <Fld
            label="EUR"
            value={form[`${x}_eur` as keyof RouteForm]}
            onChange={set(`${x}_eur` as keyof RouteForm)}
            readOnly={cur !== 'EUR'}
            unit="€"
          />
        </Box>
      </Panel>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/logistics/routes')} sx={{ textTransform: 'none' }}>
            Routes
          </Button>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {isEdit ? `Route ${routeId}` : 'New Route'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}><ErrorAlert message={error} /></Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Panel label="DETAILS">
          <Box sx={{ ...gridSx(4), mb: 1.25 }}>
            <Fld label="Reference / LOG #" value={form.reference} onChange={set('reference')} />
            <Fld label="Agent" value={form.agent} onChange={set('agent')} />
            <Sel label="Shipping Line" value={form.shipping_line} onChange={set('shipping_line')} options={SHIPPING_LINE_OPTIONS} />
            <Sel label="Container Type" value={form.container_type} onChange={set('container_type')} options={CONTAINER_OPTIONS} />
          </Box>
          <Box sx={gridSx(4)}>
            <Fld label="Origin" value={form.origin} onChange={set('origin')} />
            <Sel label="POL" value={form.origin_port} onChange={set('origin_port')} options={POL_OPTIONS} />
            <Fld label="Destination" value={form.destination} onChange={set('destination')} />
            <Sel label="POD" value={form.destination_port} onChange={set('destination_port')} options={POD_OPTIONS} />
          </Box>
        </Panel>

        <Box sx={gridSx(2, 1.5)}>
          <Panel label="SCHEDULE" color={C.log}>
            <Box sx={gridSx(2)}>
              <Fld label="TT" value={form.tt} onChange={set('tt')} />
              <Fld label="Validity" type="date" value={form.validity} onChange={set('validity')} />
            </Box>
          </Panel>
          <Panel label="RATES" color={C.log}>
            <Box sx={gridSx(2)}>
              <Fld label="$ Rate" value={form.usd_rate} onChange={set('usd_rate')} unit="₪/$" />
              <Fld label="€ Rate" value={form.eur_rate} onChange={set('eur_rate')} unit="₪/€" />
            </Box>
          </Panel>
        </Box>

        <Box sx={gridSx(4, 1.5)}>
          {INCOTERMS.map((x) => priceBox(x))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/logistics/routes')}>Cancel</Button>
        <Button type="submit" variant="contained" size="large">Save</Button>
      </Box>
    </Box>
  );
};

export default RouteFormPage;
