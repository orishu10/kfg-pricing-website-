import { EMPTY_PRICING, PRICING_KEYS, TEXT_KEYS, type PricingForm } from './consts';
import { getFxRates, type Pricing } from '../../../api';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const LB_PER_KG = 2.20462;

const INTEGER_KEYS: readonly string[] = [
  'units_in_case', 'cases_in_fcl', 'cases_per_pallet', 'pallets_per_fcl', 'pallets',
];
const RATE_KEYS: readonly string[] = ['ex_rate', 'ex_current'];

const toFixedStr = (v: string | number | null | undefined, digits: number): string => {
  if (v == null || v === '') return '';
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isNaN(n) ? String(v) : n.toFixed(digits);
};

export const to2 = (v: string | number | null | undefined): string => toFixedStr(v, 2);
export const to4 = (v: string | number | null | undefined): string => toFixedStr(v, 4);

export const pricingToForm = (p: Pricing): PricingForm => {
  const out = { ...EMPTY_PRICING };
  PRICING_KEYS.forEach((k) => {
    const v = (p as unknown as Record<string, unknown>)[k];
    if (v == null) { out[k] = ''; return; }
    if (TEXT_KEYS.includes(k) || INTEGER_KEYS.includes(k)) out[k] = String(v);
    else if (RATE_KEYS.includes(k)) out[k] = to4(v as string | number);
    else out[k] = to2(v as string | number);
  });
  return out;
};

export const symbol = (currency: string | null | undefined): string =>
  currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₪';

export const fetchFxRate = async (pair: string): Promise<number | null> => {
  const target = pair.includes('EUR') ? 'EUR' : 'USD';
  try {
    const rates = await getFxRates();
    const rate = rates[target];
    return typeof rate === 'number' && rate > 0 ? rate : null;
  } catch {
    return null;
  }
};

export const fmtDate = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
};

export const fmtDateTime = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${fmtDate(iso)} ${hh}:${mm}`;
};

export const derivePricing = (f: PricingForm): Partial<PricingForm> => {
  const num = (k: keyof PricingForm) => parseFloat(f[k]) || 0;
  const int = (k: keyof PricingForm) => parseInt(f[k], 10) || 0;

  const unit = num('supplier_price_unit');
  const uic = int('units_in_case');
  const wt = num('unit_weight');
  const cifcl = int('cases_in_fcl');
  const fob = num('fob');
  const cif = num('cif');
  const dap = num('dap');
  const ddp = num('ddp');
  const tarPct = num('us_tariff_pct');
  const kfgPct = num('kfg_commission_pct');
  const ex = num('ex_rate');
  const supCostRate = num('supervision_cost_rate');
  const supFeesRate = num('supervision_fees_rate');

  const spCase = unit > 0 && uic > 0 ? unit * uic : null;
  const spFcl = spCase != null && cifcl > 0 ? spCase * cifcl : null;
  const sp1kg = unit > 0 && wt > 0 ? unit / wt : null;

  const puUsd = ex > 0 && unit > 0 ? unit / ex : null;
  const pcUsd = ex > 0 && spCase != null ? spCase / ex : null;
  const pfUsd = pcUsd != null && cifcl > 0 ? pcUsd * cifcl : null;

  const supCostVal = cifcl > 0 && supCostRate > 0 ? supCostRate * cifcl : null;
  const supFeesVal = cifcl > 0 && supFeesRate > 0 ? supFeesRate * cifcl : null;
  const sup = (supCostVal ?? 0) + (supFeesVal ?? 0);

  const incoSum = fob + cif + dap + ddp;
  const st1 = incoSum > 0 || spFcl != null || sup > 0 ? incoSum + (spFcl ?? 0) + sup : null;

  const tarVal = pfUsd != null ? (tarPct / 100) * pfUsd : null;
  const kfgVal = st1 != null ? (kfgPct / 100) * st1 : null;
  const tar = tarVal ?? 0;
  const kfg = kfgVal ?? 0;

  const st2 = st1 != null ? st1 + tar : null;
  const imp = st1 != null && st1 > 0 ? incoSum / st1 : null;
  const kfgTot = st1 != null ? kfg + st1 : null;
  const tot = st2 != null ? st2 + kfg : null;
  const cCase = st2 != null && cifcl > 0 ? st2 / cifcl : null;
  const cUnit = cCase != null && uic > 0 ? cCase / uic : null;
  const pCase = tot != null && cifcl > 0 ? tot / cifcl : null;
  const pUnit = pCase != null && uic > 0 ? pCase / uic : null;
  const sapU = spCase != null && uic > 0 ? spCase / uic : null;

  const wtEff = f.weight_unit === 'LB' ? wt * LB_PER_KG : wt;
  const c1kg = cUnit != null && wtEff > 0 ? cUnit / wtEff : null;
  const p1kg = pUnit != null && wtEff > 0 ? pUnit / wtEff : null;
  const sap1kg = sapU != null && wtEff > 0 ? sapU / wtEff : null;

  const s = (v: number | null) => (v != null ? v.toFixed(2) : '');

  return {
    supplier_price_case: s(spCase),
    supplier_price_fcl: s(spFcl),
    supplier_price_1kg: s(sp1kg),
    price_unit_usd: s(puUsd),
    price_case_usd: s(pcUsd),
    price_fcl_usd: s(pfUsd),
    sub_total_1: s(st1),
    sub_total_2: s(st2),
    supervision_cost: s(supCostVal),
    supervision_fees: s(supFeesVal),
    us_tariff: s(tarVal),
    kfg_commission: s(kfgVal),
    import_factor: imp != null ? (imp * 100).toFixed(2) : '',
    kfg_commission_total: s(kfgTot),
    total: s(tot),
    cost_case: s(cCase),
    cost_unit: s(cUnit),
    price_case: s(pCase),
    price_unit: s(pUnit),
    sap_price_unit: s(sapU),
    cost_1kg: s(c1kg),
    price_1kg: s(p1kg),
    sap_price_1kg: s(sap1kg),
  };
};
