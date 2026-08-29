import type { PricingForm } from './consts';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Formats an ISO date as "01-JAN-25" for the table's Last Updated column.
export const fmtDate = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
};

// Computes the cost/price build-up from the item volumes (read-only) plus the
// pricing inputs. Mirrors the item helpers' calcDerived chain. Fields whose
// formulas aren't defined yet (currency ₪/$, supervision, 1KG, SAP-case) are
// left to manual entry and NOT touched here.
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
  const tar = num('us_tariff');
  const kfg = num('kfg_commission');

  const spCase = unit > 0 && uic > 0 ? unit * uic : null;
  const spFcl = spCase != null && cifcl > 0 ? spCase * cifcl : null;
  const sp1kg = unit > 0 && wt > 0 ? unit / wt : null;
  const incoSum = fob + cif + dap + ddp;
  const st1 = incoSum > 0 || spFcl != null ? incoSum + (spFcl ?? 0) : null;
  const st2 = st1 != null ? st1 + tar : null;
  const imp = spFcl != null && spFcl > 0 ? incoSum / spFcl : null;
  const kfgTot = st1 != null ? kfg + st1 : null;
  const tarTot = spFcl != null && tar > 0 ? spFcl * tar : null;
  const tot = st2 != null ? st2 + kfg : null;
  const cCase = st2 != null && cifcl > 0 ? st2 / cifcl : null;
  const cUnit = cCase != null && uic > 0 ? cCase / uic : null;
  const pCase = tot != null && cifcl > 0 ? tot / cifcl : null;
  const pUnit = pCase != null && uic > 0 ? pCase / uic : null;
  const sapU = spCase != null && uic > 0 ? spCase / uic : null;

  const s = (v: number | null) => (v != null ? v.toFixed(4) : '');

  return {
    supplier_price_case: s(spCase),
    supplier_price_fcl: s(spFcl),
    supplier_price_1kg: s(sp1kg),
    sub_total_1: s(st1),
    sub_total_2: s(st2),
    import_factor: s(imp),
    kfg_commission_total: s(kfgTot),
    tariffs_total: s(tarTot),
    total: s(tot),
    cost_case: s(cCase),
    cost_unit: s(cUnit),
    price_case: s(pCase),
    price_unit: s(pUnit),
    sap_price_unit: s(sapU),
  };
};
