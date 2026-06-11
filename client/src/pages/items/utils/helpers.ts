import type { Item } from "../../../api";
import type { FormState } from "./types";

export const toNum = (v: string): number | null => (v.trim() === '' ? null : parseFloat(v));
export const toInt = (v: string): number | null => (v.trim() === '' ? null : parseInt(v, 10));
export const fmt = (v: string | number | null | undefined): string =>
  v == null ? '' : String(v);

// Auto-calculate derived (read-only) fields from the current form state.
// Called on every edit and on initial load.
export function calcDerived(f: FormState): Partial<FormState> {
  const unit   = parseFloat(f.supplier_price_unit) || 0;
  const uic    = parseInt(f.units_in_case, 10)     || 0;
  const wt     = parseFloat(f.unit_weight)          || 0;
  const pallet = parseInt(f.pallets_per_fcl, 10)   || 0;
  const cpp    = parseInt(f.cases_per_pallet, 10)  || 0;
  const fob    = parseFloat(f.fob)                  || 0;
  const cif    = parseFloat(f.cif)                  || 0;
  const dap    = parseFloat(f.dap)                  || 0;
  const ddp    = parseFloat(f.ddp)                  || 0;
  const tar    = parseFloat(f.us_tariff)            || 0;
  const kfg    = parseFloat(f.kfg_commission)       || 0;

  // cases_in_fcl = pallets_per_fcl × cases_per_pallet
  const cifcl   = pallet > 0 && cpp > 0 ? pallet * cpp : null;
  // supplier_price_case = supplier_price_unit × units_in_case
  const sp_case = unit > 0 && uic > 0   ? unit * uic   : null;
  // supplier_price_fcl = supplier_price_case × cases_in_fcl
  const sp_fcl  = sp_case != null && cifcl != null ? sp_case * cifcl : null;
  // supplier_price_1kg = supplier_price_unit / unit_weight
  const sp_1kg  = unit > 0 && wt > 0    ? unit / wt    : null;
  // sub_total_1 = fob + cif + dap + ddp + supplier_price_fcl
  const hasInco = fob > 0 || cif > 0 || dap > 0 || ddp > 0;
  const incoSum = fob + cif + dap + ddp;
  const st1     = hasInco || sp_fcl != null ? incoSum + (sp_fcl ?? 0) : null;
  // sub_total_2 = sub_total_1 + us_tariff
  const st2     = st1 != null ? st1 + tar : null;
  // import_factor = (fob + cif + dap + ddp) / supplier_price_fcl
  const imp_f   = sp_fcl != null && sp_fcl > 0 ? incoSum / sp_fcl : null;
  // kfg_commission_total = kfg_commission + sub_total_1
  const kfg_tot = st1 != null ? kfg + st1 : null;
  // tariffs_total = supplier_price_fcl × us_tariff
  const tar_tot = sp_fcl != null && tar > 0 ? sp_fcl * tar : null;
  // total = sub_total_2 + kfg_commission
  const tot     = st2 != null ? st2 + kfg : null;
  // cost_case = sub_total_2 / cases_in_fcl
  const c_case  = st2 != null && cifcl != null && cifcl > 0 ? st2 / cifcl : null;
  // cost_unit = cost_case / units_in_case
  const c_unit  = c_case != null && uic > 0 ? c_case / uic : null;
  // price_case = total / cases_in_fcl
  const p_case  = tot != null && cifcl != null && cifcl > 0 ? tot / cifcl : null;
  // price_unit = price_case / units_in_case
  const p_unit  = p_case != null && uic > 0 ? p_case / uic : null;
  // sap_price_unit = supplier_price_case / units_in_case
  const sap_u   = sp_case != null && uic > 0 ? sp_case / uic : null;

  return {
    cases_in_fcl:        cifcl   != null ? String(cifcl)      : "",
    supplier_price_case: sp_case != null ? sp_case.toFixed(4) : "",
    supplier_price_fcl:  sp_fcl  != null ? sp_fcl.toFixed(4)  : "",
    supplier_price_1kg:  sp_1kg  != null ? sp_1kg.toFixed(4)  : "",
    sub_total_1:         st1     != null ? st1.toFixed(4)      : "",
    sub_total_2:         st2     != null ? st2.toFixed(4)      : "",
    import_factor:       imp_f   != null ? imp_f.toFixed(4)    : "",
    kfg_commission_total: kfg_tot != null ? kfg_tot.toFixed(4) : "",
    tariffs_total:       tar_tot != null ? tar_tot.toFixed(4)  : "",
    total:               tot     != null ? tot.toFixed(4)      : "",
    cost_case:           c_case  != null ? c_case.toFixed(4)   : "",
    cost_unit:           c_unit  != null ? c_unit.toFixed(4)   : "",
    price_case:          p_case  != null ? p_case.toFixed(4)   : "",
    price_unit:          p_unit  != null ? p_unit.toFixed(4)   : "",
    sap_price_unit:      sap_u   != null ? sap_u.toFixed(4)    : "",
  };
}


export const itemToForm = (item: Item): FormState => {
  return {
    name: item.name ?? "",
    supplier_incoterms: item.supplier_incoterms ?? "",
    customer_incoterms: item.customer_incoterms ?? "",
    logistics: fmt(item.logistics),
    container_type: item.container_type ?? "",
    fob: fmt(item.fob),
    cif: fmt(item.cif),
    dap: fmt(item.dap),
    ddp: fmt(item.ddp),
    cases_in_fcl: item.cases_in_fcl != null ? String(item.cases_in_fcl) : "",
    units_in_case: item.units_in_case != null ? String(item.units_in_case) : "",
    unit_weight: fmt(item.unit_weight),
    cases_per_pallet:
      item.cases_per_pallet != null ? String(item.cases_per_pallet) : "",
    pallets_per_fcl:
      item.pallets_per_fcl != null ? String(item.pallets_per_fcl) : "",
    supplier_price_unit: fmt(item.supplier_price_unit),
    supplier_price_case: fmt(item.supplier_price_case),
    supplier_price_fcl: fmt(item.supplier_price_fcl),
    supplier_price_1kg: fmt(item.supplier_price_1kg),
    sub_total_1: fmt(item.sub_total_1),
    us_tariff: fmt(item.us_tariff),
    sub_total_2: fmt(item.sub_total_2),
    import_factor: fmt(item.import_factor),
    kfg_commission: fmt(item.kfg_commission),
    total: fmt(item.total),
    kfg_commission_total: fmt(item.kfg_commission_total),
    tariffs_total: fmt(item.tariffs_total),
    usd_nis: fmt(item.usd_nis),
    cost_unit: fmt(item.cost_unit),
    cost_case: fmt(item.cost_case),
    price_unit: fmt(item.price_unit),
    price_case: fmt(item.price_case),
    sap_price_unit: fmt(item.sap_price_unit),
    sap_price_case: fmt(item.sap_price_case),
  };
};