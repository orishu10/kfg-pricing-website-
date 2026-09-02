import { useEffect, useState } from 'react';
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
import { useAuth } from '../../../context/auth';
import { ErrorAlert, LoadingPage } from '../../../components';
import { useLookups } from '../../../hooks/useLookups';
import {
  EMPTY_PRICING, ILS_SYMBOL, NUMERIC_KEYS, type PricingForm,
  PRICING_STATUS, WEIGHT_UNIT_OPTIONS,
} from '../utils/consts';
import {
  derivePricing, pricingToForm, fetchFxRate, routeIncotermPrices,
  symbol, fmtDateTime, to2, to4,
} from '../utils/helpers';
import {
  getPricing, getItems, getCustomers, getRoutes, createPricing, updatePricing,
  type PricingInput, type Route,
} from '../../../api';

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

const FieldLabel = ({ label, required }: { label?: string; required?: boolean }) =>
  label ? (
    <Typography sx={LABEL_SX}>
      {label}
      {required && <Box component="span" sx={{ color: 'error.main', ml: 0.3 }}>*</Box>}
    </Typography>
  ) : null;

const Fld = ({ label, value, onChange, readOnly, unit, required }: {
  label?: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; unit?: string; required?: boolean;
}) => (
  <Box sx={{ minWidth: 0 }}>
    <FieldLabel label={label} required={required} />
    <TextField
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      size="small"
      fullWidth
      error={required && value.trim() === ''}
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

const Sel = ({ label, value, onChange, options, required, hideEmpty }: {
  label?: string; value: string; onChange: (v: string) => void; options: Opt[]; required?: boolean; hideEmpty?: boolean;
}) => (
  <Box sx={{ minWidth: 0 }}>
    <FieldLabel label={label} required={required} />
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      displayEmpty
      error={required && value === ''}
      sx={INPUT_SX}
    >
      {!hideEmpty && <MenuItem value=""><em>—</em></MenuItem>}
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

const Panel = ({ label, color, fill, children }: {
  label?: string; color?: string; fill?: boolean; children: React.ReactNode;
}) => (
  <Box
    sx={{
      position: 'relative', bgcolor: color ?? '#fff', border: '1px solid rgba(0,0,0,0.18)',
      borderRadius: 1.5, pt: label ? 2.4 : 1.5, px: 1.5, pb: 1.5,
      ...(fill ? { height: '100%' } : {}),
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

const Caption = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: '0.6rem', color: '#777', mb: 0.5 }}>{children}</Typography>
);

export const PricingFormPage = () => {
  const { pricingId } = useParams<{ pricingId: string }>();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get('from');
  const isEdit = !!pricingId;
  const sourceId = pricingId ?? fromId ?? undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const { options } = useLookups();
  const [error, setError] = useState('');
  const [form, setForm] = useState<PricingForm>(EMPTY_PRICING);

  const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: () => getItems() });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: getRoutes });
  const sourceQuery = useQuery({
    queryKey: ['pricing', sourceId],
    queryFn: () => getPricing(sourceId!),
    enabled: !!sourceId,
  });

  const p = sourceQuery.data;
  const sig = sourceId
    ? p ? `${isEdit ? 'edit' : 'dup'}:${p.id}:${p.updated_at ?? ''}` : null
    : '__new__';
  const [synced, setSynced] = useState<string | null>(null);
  if (sig && sig !== synced) {
    setSynced(sig);
    setForm(p ? pricingToForm(p) : EMPTY_PRICING);
  }

  const set = (k: keyof PricingForm) => (v: string) =>
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      return { ...next, ...derivePricing(next) };
    });

  const onItem = (id: string) =>
    setForm((prev) => {
      const it = items.find((i) => i.id === id);
      const next: PricingForm = {
        ...prev,
        item_id: id,
        unit_weight: it ? to2(it.unit_weight) : '',
        units_in_case: it && it.units_in_case != null ? String(it.units_in_case) : '',
        cases_in_fcl: it && it.cases_in_fcl != null ? String(it.cases_in_fcl) : '',
        pack_size: it?.size ?? '',
        supplier_name: it?.supplier_name ?? '',
        description: it?.name ?? '',
      };
      return { ...next, ...derivePricing(next) };
    });

  const onCustomer = (id: string) =>
    setForm((prev) => {
      const customer = customers.find((option) => option.id === id);
      const currency = customer?.currency ?? '';
      const selectedRoute = routes.find((option) => option.id === prev.route);
      const next: PricingForm = {
        ...prev,
        customer_id: id,
        currency,
        currency_pair:
          currency === 'EUR' ? 'ILS > EUR' : currency === 'USD' ? 'ILS > USD' : prev.currency_pair,
        ...(selectedRoute ? routeIncotermPrices(selectedRoute, currency) : {}),
      };
      return { ...next, ...derivePricing(next) };
    });

  const onRoute = (id: string) =>
    setForm((prev) => {
      const route = routes.find((option) => option.id === id);
      const next: PricingForm = {
        ...prev,
        route: id,
        container_type: route?.container_type ?? '',
        ...routeIncotermPrices(route, prev.currency),
      };
      return { ...next, ...derivePricing(next) };
    });

  useEffect(() => {
    const pair = form.currency_pair;
    if (!pair) return;
    let active = true;
    fetchFxRate(pair).then((rate) => {
      if (active && rate != null) setForm((prev) => ({ ...prev, ex_current: to4(rate) }));
    });
    return () => {
      active = false;
    };
  }, [form.currency_pair]);

  const onError = (fallback: string) => (err: unknown) => {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(msg || fallback);
  };
  const done = () => {
    queryClient.invalidateQueries({ queryKey: ['pricing'] });
    navigate('/pricing');
  };

  const createMutation = useMutation({
    mutationFn: (data: PricingInput) => createPricing(data),
    onSuccess: done,
    onError: onError('Failed to create pricing'),
  });
  const updateMutation = useMutation({
    mutationFn: (data: PricingInput) => updatePricing(pricingId!, data),
    onSuccess: done,
    onError: onError('Failed to update pricing'),
  });

  const canSave = !!form.item_id && !!form.customer_id && form.ex_rate.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) {
      setError('Item, Customer and Ex Rate are required.');
      return;
    }
    setError('');
    const payload: PricingInput = { ...form, created_by: username ?? '', updated_by: username ?? '' };
    NUMERIC_KEYS.forEach((k) => {
      if ((payload[k] ?? '').toString().trim() === '') payload[k] = '0';
    });
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (sourceId && sourceQuery.isLoading) return <LoadingPage />;

  const itemOptions = items.map((i) => ({ label: i.size ? `${i.name}  ${i.size}` : i.name, value: i.id }));
  const customerOptions = customers.map((c) => ({ label: c.name, value: c.id }));

  const routeLabel = (r: Route) => {
    const leg = r.origin && r.destination ? `${r.origin} → ${r.destination}` : r.origin_port ?? '';
    return [r.reference || r.id, leg].filter(Boolean).join(' · ');
  };
  const routeOptions: Opt[] = routes.map((r) => ({ label: routeLabel(r), value: r.id }));
  if (form.route && !routes.some((r) => r.id === form.route)) {
    routeOptions.unshift({ label: form.route, value: form.route });
  }

  const sym = symbol(form.currency);
  const weightUnit = form.weight_unit || 'KG';

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pricing')} sx={{ textTransform: 'none' }}>
            Pricing
          </Button>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {isEdit ? `Pricing ${pricingId}` : 'New Pricing'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 160 }}>
            <Sel label="STATUS" value={form.status} onChange={set('status')} options={PRICING_STATUS} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}><ErrorAlert message={error} /></Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
            columnGap: 2, rowGap: 2.5, alignItems: 'stretch',
          }}
        >
          <Panel label="DESCRIPTION" fill>
            <Box sx={gridSx(3)}>
              <Sel label="Item" required value={form.item_id} onChange={onItem} options={itemOptions} />
              <Fld label="Currency" value={form.currency} readOnly />
              <Fld label="Pack Size" value={form.pack_size} readOnly />
              <Fld label="Supplier" value={form.supplier_name} readOnly />
              <Sel label="Customer" required value={form.customer_id} onChange={onCustomer} options={customerOptions} />
              <Fld label="KFG SKU #" value={form.kfg_sku} onChange={set('kfg_sku')} />
            </Box>
          </Panel>
          <Panel fill>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, mb: 1 }}>Currency Exchange</Typography>
            <Box sx={{ mb: 1.25 }}>
              <Sel value={form.currency_pair} onChange={set('currency_pair')} options={options('currency_pair', form.currency_pair)} />
            </Box>
            <Box sx={gridSx(2)}>
              <Fld label="Ex Rate" required value={form.ex_rate} onChange={set('ex_rate')} />
              <Fld label="Ex Current" value={form.ex_current} readOnly />
            </Box>
          </Panel>

          <Panel label="LOG" color={C.log} fill>
            <Box sx={{ ...gridSx(4), mb: 1.25 }}>
              <Fld label="Unit Weight" value={form.unit_weight} readOnly />
              <Fld label="Units / Case" value={form.units_in_case} readOnly />
              <Fld label="Cases / Pallet" value={form.cases_per_pallet} onChange={set('cases_per_pallet')} />
              <Fld label="Cases / FCL" value={form.cases_in_fcl} readOnly />
            </Box>
            <Box sx={gridSx(4)}>
              <Fld label="FOB" value={form.fob} readOnly unit={sym} />
              <Fld label="CIF" value={form.cif} readOnly unit={sym} />
              <Fld label="DAP" value={form.dap} readOnly unit={sym} />
              <Fld label="DDP" value={form.ddp} readOnly unit={sym} />
            </Box>
          </Panel>
          <Panel color={C.log} fill>
            <Box sx={{ mb: 1.25 }}>
              <Sel label="Route" value={form.route} onChange={onRoute} options={routeOptions} />
            </Box>
            <Box sx={gridSx(2)}>
              <Fld label="Container Type" value={form.container_type} readOnly />
              <Fld label="Pallets" value={form.pallets} onChange={set('pallets')} />
            </Box>
          </Panel>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 2, alignItems: 'stretch' }}>
          <Panel label="SUPPLIER" color={C.green} fill>
            <Box sx={gridSx(5)}>
              <Fld label="Price - Unit" value={form.supplier_price_unit} onChange={set('supplier_price_unit')} unit={ILS_SYMBOL} />
              <Fld label="Price - Unit" value={form.price_unit_usd} readOnly unit={sym} />
              <Fld label="Price - Case" value={form.supplier_price_case} readOnly unit={ILS_SYMBOL} />
              <Fld label="Price - Case" value={form.price_case_usd} readOnly unit={sym} />
              <Fld label="Price - FCL" value={form.price_fcl_usd} readOnly unit={sym} />
            </Box>
          </Panel>
          <Panel color={C.green} fill>
            <Sel label="Incoterms - Supplier" value={form.incoterms_supplier} onChange={set('incoterms_supplier')} options={options('incoterms', form.incoterms_supplier)} />
          </Panel>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 2, alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2.5 }}>
            <Box sx={gridSx(3, 1.5)}>
              <Panel label="SUBTOTAL 1" color={C.pink}>
                <Caption>LOG + Supplier + Supervision</Caption>
                <Fld value={form.sub_total_1} readOnly unit={sym} />
              </Panel>
              <Panel label="SUBTOTAL 2" color={C.pink}>
                <Caption>LOG + Supplier + US Tariff</Caption>
                <Fld value={form.sub_total_2} readOnly unit={sym} />
              </Panel>
              <Panel label="TOTAL" color={C.blue}>
                <Caption>Subtotal 2 + KFG</Caption>
                <Fld value={form.total} readOnly unit={sym} />
              </Panel>
            </Box>

            <Box sx={gridSx(2, 1.5)}>
              <Panel label="KFG COMMISSION" color={C.grey}>
                <Box sx={gridSx(2)}>
                  <Fld value={form.kfg_commission_pct} onChange={set('kfg_commission_pct')} unit="%" />
                  <Fld value={form.kfg_commission} readOnly unit={sym} />
                </Box>
              </Panel>
              <Panel label="US TARIFF" color={C.tariff}>
                <Box sx={gridSx(2)}>
                  <Fld value={form.us_tariff_pct} onChange={set('us_tariff_pct')} unit="%" />
                  <Fld value={form.us_tariff} readOnly unit={sym} />
                </Box>
              </Panel>
            </Box>

            <Panel label="SUPERVISION">
              <Box sx={gridSx(4)}>
                <Fld label="Cost / Case" value={form.supervision_cost_rate} onChange={set('supervision_cost_rate')} unit={sym} />
                <Fld label="Cost Total" value={form.supervision_cost} readOnly unit={sym} />
                <Fld label="Fees / Case" value={form.supervision_fees_rate} onChange={set('supervision_fees_rate')} unit={sym} />
                <Fld label="Fees Total" value={form.supervision_fees} readOnly unit={sym} />
              </Box>
            </Panel>
          </Box>

          <Panel fill>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>{`1${weightUnit} INDICATOR`}</Typography>
              <Box sx={{ width: 90 }}>
                <Sel value={weightUnit} onChange={set('weight_unit')} options={WEIGHT_UNIT_OPTIONS} hideEmpty />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ bgcolor: C.pink, borderRadius: 1, p: 1 }}>
                <Fld label={`Cost - 1${weightUnit}`} value={form.cost_1kg} readOnly unit={sym} />
              </Box>
              <Box sx={{ bgcolor: C.blue, borderRadius: 1, p: 1 }}>
                <Fld label={`Price - 1${weightUnit}`} value={form.price_1kg} readOnly unit={sym} />
              </Box>
              <Box sx={{ bgcolor: C.yellow, borderRadius: 1, p: 1 }}>
                <Fld label={`SAP Price - 1${weightUnit}`} value={form.sap_price_1kg} readOnly unit={sym} />
              </Box>
            </Box>
          </Panel>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 2, alignItems: 'stretch' }}>
          <Box sx={{ ...gridSx(3, 1.5), gridTemplateRows: '1fr' }}>
            <Panel color={C.pink} fill>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: 1 }}>
                <Fld label="Cost - Unit" value={form.cost_unit} readOnly unit={sym} />
                <Fld label="Cost - Case" value={form.cost_case} readOnly unit={sym} />
              </Box>
            </Panel>
            <Panel color={C.blue} fill>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: 1 }}>
                <Fld label="Price - Unit" value={form.price_unit} readOnly unit={sym} />
                <Fld label="Price - Case" value={form.price_case} readOnly unit={sym} />
              </Box>
            </Panel>
            <Panel color={C.yellow} fill>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: 1 }}>
                <Fld label="SAP Price - Unit" value={form.sap_price_unit} onChange={set('sap_price_unit')} unit={sym} />
                <Fld label="SAP Price - Case" value={form.sap_price_case} readOnly unit={sym} />
              </Box>
            </Panel>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
            <Panel>
              <Fld label="Import Factor" value={form.import_factor} readOnly unit="%" />
            </Panel>
            <Box sx={{ display: 'flex', gap: 1, visibility: isEdit ? 'visible' : 'hidden' }}>
              <Box sx={{ flex: 1, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 1, p: 1 }}>
                <Typography sx={{ fontSize: '0.6rem', color: '#888' }}>Created by</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{p?.created_by || '—'}</Typography>
                <Typography sx={{ fontSize: '0.66rem', color: '#999' }}>{fmtDateTime(p?.created_at ?? null) || '—'}</Typography>
              </Box>
              <Box sx={{ flex: 1, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 1, p: 1 }}>
                <Typography sx={{ fontSize: '0.6rem', color: '#888' }}>Last Updated by</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{p?.updated_by || '—'}</Typography>
                <Typography sx={{ fontSize: '0.66rem', color: '#999' }}>{fmtDateTime(p?.updated_at ?? null) || '—'}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/pricing')}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={!canSave} size="large">Save</Button>
      </Box>
    </Box>
  );
};

export default PricingFormPage;
