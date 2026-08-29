import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../context/AuthContext';
import { ErrorAlert, LoadingPage } from '../../../components';
import { fmt } from '../../items/utils/helpers';
import {
  EMPTY_PRICING, PRICING_KEYS, NUMERIC_KEYS, type PricingForm,
  PRICING_STATUS, CONTAINER_OPTIONS, INCOTERMS_OPTIONS, CURRENCY_OPTIONS, CURRENCY_PAIR_OPTIONS,
} from '../utils/consts';
import { derivePricing } from '../utils/helpers';
import {
  getPricing, getItems, getCustomers, createPricing, updatePricing,
  type Pricing, type PricingInput,
} from '../../../api';

type Opt = string | { label: string; value: string };

// Pastel panel backgrounds matching the printed pricing sheet.
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

const Sel = ({ label, value, onChange, options, required }: {
  label?: string; value: string; onChange: (v: string) => void; options: Opt[]; required?: boolean;
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

const Caption = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: '0.6rem', color: '#777', mb: 0.5 }}>{children}</Typography>
);

const pricingToForm = (p: Pricing): PricingForm => {
  const out = { ...EMPTY_PRICING };
  PRICING_KEYS.forEach((k) => {
    const v = (p as unknown as Record<string, unknown>)[k];
    out[k] = v == null ? '' : String(v);
  });
  return out;
};

export const PricingFormPage = () => {
  const { pricingId } = useParams<{ pricingId: string }>();
  const isEdit = !!pricingId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState<PricingForm>(EMPTY_PRICING);

  const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: () => getItems() });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const pricingQuery = useQuery({
    queryKey: ['pricing', pricingId],
    queryFn: () => getPricing(pricingId!),
    enabled: isEdit,
  });

  // Seed the form for edit once the record loads (during render, keyed on identity).
  const p = pricingQuery.data;
  const sig = isEdit ? (p ? `${p.id}:${p.updated_at ?? ''}` : null) : '__new__';
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
        unit_weight: it ? fmt(it.unit_weight) : '',
        units_in_case: it && it.units_in_case != null ? String(it.units_in_case) : '',
        cases_in_fcl: it && it.cases_in_fcl != null ? String(it.cases_in_fcl) : '',
        pack_size: it?.size ?? '',
        supplier_name: it?.supplier_name ?? '',
        description: it?.name ?? '',
      };
      return { ...next, ...derivePricing(next) };
    });

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
    // Optional numeric fields default to 0 when left blank (never empty).
    const payload: PricingInput = { ...form, created_by: username ?? '', updated_by: username ?? '' };
    NUMERIC_KEYS.forEach((k) => {
      if ((payload[k] ?? '').toString().trim() === '') payload[k] = '0';
    });
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (isEdit && pricingQuery.isLoading) return <LoadingPage />;

  const itemOptions = items.map((i) => ({ label: i.size ? `${i.name} — ${i.size}` : i.name, value: i.id }));
  const customerOptions = customers.map((c) => ({ label: c.name, value: c.id }));

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Header bar */}
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
          <Button type="submit" variant="contained" disabled={!canSave} size="large">
            Save
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}><ErrorAlert message={error} /></Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 2, alignItems: 'start' }}>
        {/* LEFT */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Panel label="DESCRIPTION">
            <Box sx={gridSx(3)}>
              <Sel label="Item" required value={form.item_id} onChange={onItem} options={itemOptions} />
              <Sel label="Currency" value={form.currency} onChange={set('currency')} options={CURRENCY_OPTIONS} />
              <Fld label="Pack Size" value={form.pack_size} readOnly />
              <Fld label="Supplier" value={form.supplier_name} readOnly />
              <Sel label="Customer" required value={form.customer_id} onChange={set('customer_id')} options={customerOptions} />
              <Fld label="KFG SKU #" value={form.kfg_sku} onChange={set('kfg_sku')} />
            </Box>
          </Panel>

          <Panel label="LOG" color={C.log}>
            <Box sx={{ ...gridSx(4), mb: 1.25 }}>
              <Fld label="Unit Weight" value={form.unit_weight} readOnly />
              <Fld label="Units / Case" value={form.units_in_case} readOnly />
              <Fld label="Cases / Pallet" value={form.cases_per_pallet} onChange={set('cases_per_pallet')} />
              <Fld label="Cases / FCL" value={form.cases_in_fcl} readOnly />
            </Box>
            <Box sx={gridSx(4)}>
              <Fld label="FOB" value={form.fob} onChange={set('fob')} unit="$" />
              <Fld label="CIF" value={form.cif} onChange={set('cif')} unit="$" />
              <Fld label="DAP" value={form.dap} onChange={set('dap')} unit="$" />
              <Fld label="DDP" value={form.ddp} onChange={set('ddp')} unit="$" />
            </Box>
          </Panel>

          <Panel label="SUPPLIER" color={C.green}>
            <Box sx={gridSx(5)}>
              <Fld label="Price - Unit" value={form.supplier_price_unit} onChange={set('supplier_price_unit')} unit="₪" />
              <Fld label="Price - Unit" value={form.price_unit_usd} onChange={set('price_unit_usd')} unit="$" />
              <Fld label="Price - Case" value={form.supplier_price_case} readOnly unit="₪" />
              <Fld label="Price - Case" value={form.price_case_usd} onChange={set('price_case_usd')} unit="$" />
              <Fld label="Price - FCL" value={form.price_fcl_usd} onChange={set('price_fcl_usd')} unit="$" />
            </Box>
          </Panel>

          <Box sx={gridSx(3, 1.5)}>
            <Panel label="SUBTOTAL 1" color={C.pink}>
              <Caption>LOG + Supplier + Supervision</Caption>
              <Fld value={form.sub_total_1} readOnly unit="₪" />
            </Panel>
            <Panel label="SUBTOTAL 2" color={C.pink}>
              <Caption>LOG + Supplier + US Tariff</Caption>
              <Fld value={form.sub_total_2} readOnly unit="₪" />
            </Panel>
            <Panel label="TOTAL" color={C.blue}>
              <Caption>Subtotal 2 + KFG</Caption>
              <Fld value={form.total} readOnly unit="₪" />
            </Panel>
          </Box>

          <Box sx={gridSx(2, 1.5)}>
            <Panel label="KFG COMMISSION" color={C.grey}>
              <Box sx={gridSx(2)}>
                <Fld value={form.kfg_commission_pct} onChange={set('kfg_commission_pct')} unit="%" />
                <Fld value={form.kfg_commission} onChange={set('kfg_commission')} unit="₪" />
              </Box>
            </Panel>
            <Panel label="US TARIFF" color={C.tariff}>
              <Box sx={gridSx(2)}>
                <Fld value={form.us_tariff_pct} onChange={set('us_tariff_pct')} unit="%" />
                <Fld value={form.us_tariff} onChange={set('us_tariff')} unit="$" />
              </Box>
            </Panel>
          </Box>

          <Panel label="SUPERVISION">
            <Box sx={gridSx(2)}>
              <Fld label="Cost" value={form.supervision_cost} onChange={set('supervision_cost')} unit="₪" />
              <Fld label="Fees" value={form.supervision_fees} onChange={set('supervision_fees')} unit="₪" />
            </Box>
          </Panel>

          <Box sx={gridSx(3, 1.5)}>
            <Panel color={C.pink}>
              <Fld label="Cost - Unit" value={form.cost_unit} readOnly unit="₪" />
              <Box sx={{ mt: 1 }}><Fld label="Cost - Case" value={form.cost_case} readOnly unit="₪" /></Box>
            </Panel>
            <Panel color={C.blue}>
              <Fld label="Price - Unit" value={form.price_unit} readOnly unit="₪" />
              <Box sx={{ mt: 1 }}><Fld label="Price - Case" value={form.price_case} readOnly unit="₪" /></Box>
            </Panel>
            <Panel color={C.yellow}>
              <Fld label="SAP Price - Unit" value={form.sap_price_unit} readOnly unit="₪" />
              <Box sx={{ mt: 1 }}><Fld label="SAP Price - Case" value={form.sap_price_case} onChange={set('sap_price_case')} unit="₪" /></Box>
            </Panel>
          </Box>
        </Box>

        {/* RIGHT */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Panel>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, mb: 1 }}>Currency Exchange</Typography>
            <Box sx={{ mb: 1.25 }}>
              <Sel value={form.currency_pair} onChange={set('currency_pair')} options={CURRENCY_PAIR_OPTIONS} />
            </Box>
            <Box sx={gridSx(2)}>
              <Fld label="Ex Rate" required value={form.ex_rate} onChange={set('ex_rate')} />
              <Fld label="Ex Current" value={form.ex_current} onChange={set('ex_current')} />
            </Box>
          </Panel>

          <Panel color={C.log}>
            <Box sx={{ mb: 1.25 }}><Fld label="Route" value={form.route} onChange={set('route')} /></Box>
            <Box sx={gridSx(2)}>
              <Sel label="Container Type" value={form.container_type} onChange={set('container_type')} options={CONTAINER_OPTIONS} />
              <Fld label="Pallets" value={form.pallets} onChange={set('pallets')} />
            </Box>
          </Panel>

          <Panel color={C.green}>
            <Sel label="Incoterms - Supplier" value={form.incoterms_supplier} onChange={set('incoterms_supplier')} options={INCOTERMS_OPTIONS} />
          </Panel>

          <Panel>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, mb: 1 }}>1KG INDICATOR</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ bgcolor: C.pink, borderRadius: 1, p: 1 }}>
                <Fld label="Cost - 1KG" value={form.cost_1kg} onChange={set('cost_1kg')} unit="₪" />
              </Box>
              <Box sx={{ bgcolor: C.blue, borderRadius: 1, p: 1 }}>
                <Fld label="Price - 1KG" value={form.price_1kg} onChange={set('price_1kg')} unit="₪" />
              </Box>
              <Box sx={{ bgcolor: C.yellow, borderRadius: 1, p: 1 }}>
                <Fld label="SAP Price - 1KG" value={form.sap_price_1kg} onChange={set('sap_price_1kg')} unit="₪" />
              </Box>
            </Box>
          </Panel>

          <Panel>
            <Fld label="Import Factor" value={form.import_factor} readOnly unit="%" />
          </Panel>

          {isEdit && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box sx={{ flex: 1, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 1, p: 1 }}>
                <Typography sx={{ fontSize: '0.6rem', color: '#888' }}>Created by</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{p?.created_by || '—'}</Typography>
              </Box>
              <Box sx={{ flex: 1, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 1, p: 1 }}>
                <Typography sx={{ fontSize: '0.6rem', color: '#888' }}>Last Updated by</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{p?.updated_by || '—'}</Typography>
              </Box>
            </Box>
          )}
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
