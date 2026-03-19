import type { FormState } from "./types";

export const toNum = (v: string): number | null => (v.trim() === '' ? null : parseFloat(v));
export const toInt = (v: string): number | null => (v.trim() === '' ? null : parseInt(v, 10));
export const fmt = (v: string | number | null | undefined): string =>
  v == null ? '' : String(v);


export function calcDerived(f: FormState): Partial<FormState> {
  const unit = parseFloat(f.supplier_price_unit) || 0;
  const uic  = parseInt(f.units_in_case, 10)     || 0;
  const cif  = parseInt(f.cases_in_fcl, 10)       || 0;
  const wt   = parseFloat(f.unit_weight)           || 0;
  const logi = parseFloat(f.logistics)             || 0;
  const tar  = parseFloat(f.us_tariff)             || 0;
  const kfg  = parseFloat(f.kfg_commission)        || 0;

  const sp_case = unit && uic   ? unit * uic       : null;
  const sp_fcl  = sp_case && cif ? sp_case * cif   : null;
  const sp_1kg  = unit && wt    ? unit / wt         : null;
  const st1     = logi || unit  ? logi + unit       : null;
  const st2     = st1 != null   ? st1 + tar         : null;
  const tot     = st2 != null   ? st2 + kfg         : null;

  return {
    supplier_price_case: sp_case != null ? sp_case.toFixed(4) : "",
    supplier_price_fcl:  sp_fcl  != null ? sp_fcl.toFixed(4)  : "",
    supplier_price_1kg:  sp_1kg  != null ? sp_1kg.toFixed(4)  : "",
    sub_total_1:         st1     != null ? st1.toFixed(4)      : "",
    sub_total_2:         st2     != null ? st2.toFixed(4)      : "",
    total:               tot     != null ? tot.toFixed(4)      : "",
  };
}