import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../../context/auth';
import { ErrorAlert, LoadingPage } from '../../../../components';
import { FormField, FormSelect, FormPanel, gridSx } from '../../components/form';
import {
  EMPTY_ROUTE, CURRENCY_OPTIONS, CONTAINER_OPTIONS, INCOTERMS,
  SHIPPING_LINE_OPTIONS, POL_OPTIONS, POD_OPTIONS, type RouteForm,
} from '../utils/consts';
import { deriveRoute, routeToForm } from '../utils/helpers';
import {
  getRoute, createRoute, updateRoute, type RouteInput,
} from '../../../../api';

const C = {
  log: '#e9e4f2', green: '#e6efe1', pink: '#f6e2e2', blue: '#dcecf4',
  grey: '#e6e6e6', tariff: '#e7dbf1', yellow: '#f6efc0',
};

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
      <FormPanel key={x} label={x.toUpperCase()} color={PRICE_COLORS[x]}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormSelect
            label="Currency"
            value={form[`${x}_currency` as keyof RouteForm]}
            onChange={set(`${x}_currency` as keyof RouteForm)}
            options={CURRENCY_OPTIONS}
          />
          <FormField
            label="ILS"
            value={form[`${x}_ils` as keyof RouteForm]}
            onChange={set(`${x}_ils` as keyof RouteForm)}
            readOnly={cur !== 'ILS'}
            unit="₪"
          />
          <FormField
            label="USD"
            value={form[`${x}_usd` as keyof RouteForm]}
            onChange={set(`${x}_usd` as keyof RouteForm)}
            readOnly={cur !== 'USD'}
            unit="$"
          />
          <FormField
            label="EUR"
            value={form[`${x}_eur` as keyof RouteForm]}
            onChange={set(`${x}_eur` as keyof RouteForm)}
            readOnly={cur !== 'EUR'}
            unit="€"
          />
        </Box>
      </FormPanel>
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
        <FormPanel label="DETAILS">
          <Box sx={{ ...gridSx(4), mb: 1.25 }}>
            <FormField label="Reference / LOG #" value={form.reference} onChange={set('reference')} />
            <FormField label="Agent" value={form.agent} onChange={set('agent')} />
            <FormSelect label="Shipping Line" value={form.shipping_line} onChange={set('shipping_line')} options={SHIPPING_LINE_OPTIONS} />
            <FormSelect label="Container Type" value={form.container_type} onChange={set('container_type')} options={CONTAINER_OPTIONS} />
          </Box>
          <Box sx={gridSx(4)}>
            <FormField label="Origin" value={form.origin} onChange={set('origin')} />
            <FormSelect label="POL" value={form.origin_port} onChange={set('origin_port')} options={POL_OPTIONS} />
            <FormField label="Destination" value={form.destination} onChange={set('destination')} />
            <FormSelect label="POD" value={form.destination_port} onChange={set('destination_port')} options={POD_OPTIONS} />
          </Box>
        </FormPanel>

        <Box sx={gridSx(2, 1.5)}>
          <FormPanel label="SCHEDULE" color={C.log}>
            <Box sx={gridSx(2)}>
              <FormField label="TT" value={form.tt} onChange={set('tt')} />
              <FormField label="Validity" type="date" value={form.validity} onChange={set('validity')} />
            </Box>
          </FormPanel>
          <FormPanel label="RATES" color={C.log}>
            <Box sx={gridSx(2)}>
              <FormField label="$ Rate" value={form.usd_rate} onChange={set('usd_rate')} unit="₪/$" />
              <FormField label="€ Rate" value={form.eur_rate} onChange={set('eur_rate')} unit="₪/€" />
            </Box>
          </FormPanel>
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
