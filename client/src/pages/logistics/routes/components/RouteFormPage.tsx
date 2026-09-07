import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../../../../context/auth';
import {
  ConfirmDialog, ErrorAlert, LoadingPage, SegmentedControl, useDiscardGuard, useToast,
} from '../../../../components';
import { FormField, FormSelect, FormPanel, gridSx } from '../../components/form';
import { useLookups } from '../../../../hooks/useLookups';
import { changedFieldCount } from '../../../../utils/forms';
import { formatNumber } from '../../../../utils/format';
import { formatDate } from '../../../../utils/time';
import {
  EMPTY_ROUTE, CURRENCY_OPTIONS, CURRENCY_SYMBOLS, FX_STALE_MS, INCOTERMS, ROUTE_CURRENCIES,
  type Incoterm, type RouteCurrency, type RouteForm,
} from '../utils/consts';
import {
  daysUntil, deriveRoute, incotermAmounts, incotermCurrency, routeToForm, routeTotals, totalCurrency, validityChip,
} from '../utils/helpers';
import {
  getRoute, createRoute, updateRoute, getFxRates, getWeeklyShipments, getPricings, type RouteInput,
} from '../../../../api';

const SUMMARY_CARD_SX = {
  bgcolor: '#fff',
  border: '1px solid rgba(0,0,0,0.18)',
  borderRadius: 1.5,
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
} as const;

const CARD_LABEL_SX = { fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.6, color: '#555' } as const;

const money = (currency: RouteCurrency, value: number | null) =>
  value == null ? '—' : `${CURRENCY_SYMBOLS[currency]} ${formatNumber(value.toFixed(2))}`;

export const RouteFormPage = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get('from');
  const focusValidity = searchParams.get('focus') === 'validity';
  const isEdit = !!routeId;
  const sourceId = routeId ?? fromId ?? undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const { showToast } = useToast();
  const { options } = useLookups();
  const [error, setError] = useState('');
  const [form, setForm] = useState<RouteForm>(EMPTY_ROUTE);

  const sourceQuery = useQuery({
    queryKey: ['route', sourceId],
    queryFn: () => getRoute(sourceId!),
    enabled: !!sourceId,
  });
  const { data: fxRates } = useQuery({ queryKey: ['fx'], queryFn: getFxRates, staleTime: FX_STALE_MS, retry: 0 });
  const { data: shipments = [] } = useQuery({ queryKey: ['weekly-shipments'], queryFn: getWeeklyShipments, enabled: isEdit });
  const { data: pricings = [] } = useQuery({ queryKey: ['pricing'], queryFn: getPricings, enabled: isEdit });

  const r = sourceQuery.data;
  const sig = sourceId
    ? r ? `${isEdit ? 'edit' : 'dup'}:${r.id}:${r.updated_at ?? ''}` : null
    : '__new__';
  const [synced, setSynced] = useState<string | null>(null);
  if (sig && sig !== synced) {
    setSynced(sig);
    setForm(r ? routeToForm(r) : EMPTY_ROUTE);
  }

  const initialForm = r ? routeToForm(r) : EMPTY_ROUTE;
  const changedCount = changedFieldCount(form, initialForm);
  const { guardOpen, guard, discard, keepEditing } = useDiscardGuard(changedCount > 0);
  const leave = () => navigate('/logistics/routes');

  const update = (patch: Partial<RouteForm>) =>
    setForm((prev) => {
      const next = { ...prev, ...patch };
      return { ...next, ...deriveRoute(next) };
    });

  const set = (k: keyof RouteForm) => (v: string) => update({ [k]: v });

  const onError = (fallback: string) => (err: unknown) => {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(msg || fallback);
  };
  const done = () => {
    queryClient.invalidateQueries({ queryKey: ['routes'] });
    queryClient.invalidateQueries({ queryKey: ['route-expiry-status'] });
    showToast({
      title: `Route ${form.reference || routeId || ''} saved`.replace(/\s+/g, ' ').trim(),
      description: form.validity ? `Valid until ${formatDate(form.validity)}` : undefined,
    });
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
  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload: RouteInput = { ...form, created_by: username ?? '', updated_by: username ?? '' };
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (sourceId && sourceQuery.isLoading) return <LoadingPage />;

  const totals = routeTotals(form);
  const totalCur = totalCurrency(form);
  const otherCurrencies = ROUTE_CURRENCIES.filter((currency) => currency !== totalCur);
  const validity = validityChip(daysUntil(form.validity || null));
  const usedByShipments = isEdit ? shipments.filter((shipment) => shipment.route === routeId).length : 0;
  const usedByPricings = isEdit ? pricings.filter((pricing) => pricing.route === routeId).length : 0;

  const applyTodayRates = () => {
    if (!fxRates) return;
    update({
      usd_rate: fxRates.USD != null ? fxRates.USD.toFixed(4) : form.usd_rate,
      eur_rate: fxRates.EUR != null ? fxRates.EUR.toFixed(4) : form.eur_rate,
    });
  };

  const priceBox = (x: Incoterm) => {
    const currency = incotermCurrency(form, x);
    const amounts = incotermAmounts(form, x);
    const activeKey = `${x}_${currency.toLowerCase()}` as keyof RouteForm;
    return (
      <FormPanel key={x} label={x.toUpperCase()}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <SegmentedControl
            value={currency}
            onChange={set(`${x}_currency` as keyof RouteForm)}
            options={CURRENCY_OPTIONS}
          />
          <FormField
            value={form[activeKey]}
            onChange={set(activeKey)}
            unit={CURRENCY_SYMBOLS[currency]}
            emphasized
          />
          {ROUTE_CURRENCIES.filter((other) => other !== currency).map((other) => (
            <Box
              key={other}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}
            >
              <Box component="span" sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.5, color: 'text.disabled' }}>
                {CURRENCY_SYMBOLS[other]} AUTO
              </Box>
              <span>{amounts[other] == null ? '—' : formatNumber(amounts[other]!.toFixed(2))}</span>
            </Box>
          ))}
        </Box>
      </FormPanel>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => guard(leave)} sx={{ textTransform: 'none' }}>
            Routes
          </Button>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {isEdit ? `Route ${routeId}` : 'New Route'}
          </Typography>
          {form.reference && (
            <Chip size="small" variant="outlined" label={form.reference} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
          <Box sx={{ width: 180 }}>
            <FormField label="VALIDITY" type="date" value={form.validity} onChange={set('validity')} autoFocus={focusValidity} />
          </Box>
          {validity && (
            <Chip
              label={validity.label}
              sx={{ height: 40, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700, ...validity.styles }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}><ErrorAlert message={error} /></Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 300px' }, gap: 2.5, alignItems: 'start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormPanel label="ROUTE">
            <Box sx={{ ...gridSx(3), mb: 1.25 }}>
              <FormField label="Reference / LOG #" value={form.reference} onChange={set('reference')} />
              <FormField label="Origin" value={form.origin} onChange={set('origin')} />
              <FormField label="Destination" value={form.destination} onChange={set('destination')} />
            </Box>
            <Box sx={gridSx(3)}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 1, fontSize: '0.72rem', color: 'text.disabled' }}>
                {[form.origin, form.destination].filter(Boolean).join(' → ')}
                {form.tt ? ` · ${form.tt} days` : ''}
              </Box>
              <FormSelect label="POL" value={form.origin_port} onChange={set('origin_port')} options={options('sea_port', form.origin_port)} />
              <FormSelect label="POD" value={form.destination_port} onChange={set('destination_port')} options={options('sea_port', form.destination_port)} />
            </Box>
          </FormPanel>

          <FormPanel label="DETAILS">
            <Box sx={gridSx(4)}>
              <FormField label="Agent" value={form.agent} onChange={set('agent')} />
              <FormSelect label="Shipping Line" value={form.shipping_line} onChange={set('shipping_line')} options={options('shipping_line', form.shipping_line)} />
              <FormSelect label="Container Type" value={form.container_type} onChange={set('container_type')} options={options('container', form.container_type)} />
              <FormField label="TT" value={form.tt} onChange={set('tt')} unit="days" />
            </Box>
          </FormPanel>

          <FormPanel label="RATES">
            <Box sx={{ ...gridSx(4), alignItems: 'end' }}>
              <FormField label="$ Rate" value={form.usd_rate} onChange={set('usd_rate')} unit="₪/$" />
              <FormField label="€ Rate" value={form.eur_rate} onChange={set('eur_rate')} unit="₪/€" />
              <Box sx={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 1, minHeight: 40, fontSize: '0.72rem', color: 'text.secondary' }}>
                {fxRates && (fxRates.USD != null || fxRates.EUR != null) ? (
                  <>
                    <RefreshIcon sx={{ fontSize: '0.9rem' }} />
                    <span>
                      Bank of Israel today:
                      {fxRates.USD != null ? ` $ ${fxRates.USD.toFixed(4)}` : ''}
                      {fxRates.USD != null && fxRates.EUR != null ? ' ·' : ''}
                      {fxRates.EUR != null ? ` € ${fxRates.EUR.toFixed(4)}` : ''}
                    </span>
                    <Button size="small" onClick={applyTodayRates} sx={{ fontSize: '0.72rem', py: 0, minWidth: 0 }}>
                      Use today's
                    </Button>
                  </>
                ) : (
                  <span>Today's Bank of Israel rates are unavailable.</span>
                )}
              </Box>
            </Box>
          </FormPanel>

          <Box sx={gridSx(4, 1.5)}>
            {INCOTERMS.map((x) => priceBox(x))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, position: { md: 'sticky' }, top: 24 }}>
          <Box sx={SUMMARY_CARD_SX}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Typography sx={CARD_LABEL_SX}>TOTAL COST</Typography>
              <Box sx={{ width: 130 }}>
                <SegmentedControl value={totalCur} onChange={set('total_currency')} options={CURRENCY_OPTIONS} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.1 }}>
              {money(totalCur, totals[totalCur])}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {otherCurrencies.map((currency) => money(currency, totals[currency])).join(' · ')}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {INCOTERMS.map((x, index) => (
                <Box
                  key={x}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.75,
                    fontSize: '0.8rem',
                    borderBottom: index < INCOTERMS.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <span>{x.toUpperCase()}</span>
                  <Box component="span" sx={{ fontWeight: 600 }}>{money(totalCur, incotermAmounts(form, x)[totalCur])}</Box>
                </Box>
              ))}
            </Box>
          </Box>

          {isEdit && (
            <Box sx={SUMMARY_CARD_SX}>
              <Typography sx={CARD_LABEL_SX}>USED BY</Typography>
              <Typography sx={{ fontSize: '0.8rem' }}>
                {usedByShipments} shipment{usedByShipments === 1 ? '' : 's'} · {usedByPricings} pricing sheet{usedByPricings === 1 ? '' : 's'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
                Changing prices does not update saved pricing.
              </Typography>
            </Box>
          )}

          {r && isEdit && (
            <Typography sx={{ fontSize: '0.72rem', color: '#eee', px: 0.5, lineHeight: 1.5 }}>
              Created by {r.created_by || '—'} · {formatDate(r.created_at)}
              {r.updated_at ? <><br />Updated {formatDate(r.updated_at)}{r.updated_by ? ` by ${r.updated_by}` : ''}</> : null}
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => guard(leave)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="contained" size="large" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={guardOpen}
        severity="warning"
        title="Discard changes?"
        message={changedCount === 1 ? '1 field was changed and not saved.' : `${changedCount} fields were changed and not saved.`}
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={discard}
        onCancel={keepEditing}
      />
    </Box>
  );
};

export default RouteFormPage;
