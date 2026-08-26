import type { FormState } from "./types";

export const EMPTY_FORM: FormState = {
  name: '', size: '', supplier_incoterms: '', customer_incoterms: '',
  logistics: '', container_type: '',
  fob: '', cif: '', dap: '', ddp: '',
  cases_in_fcl: '', units_in_case: '', unit_weight: '',
  cases_per_pallet: '', pallets_per_fcl: '',
  supplier_price_unit: '', supplier_price_case: '', supplier_price_fcl: '', supplier_price_1kg: '',
  sub_total_1: '', us_tariff: '', sub_total_2: '',
  import_factor: '', kfg_commission: '', total: '',
  kfg_commission_total: '', tariffs_total: '', usd_nis: '',
  cost_unit: '', cost_case: '', price_unit: '', price_case: '',
  sap_price_unit: '', sap_price_case: '',
};

export const CONTAINER_OPTIONS = ['REF40HC', 'REF20HC', 'DRY40HC', 'DRY20HC'];

export const INCOTERMS_OPTIONS = ['FCA', 'FOB', 'CIF', 'DAP', 'DDP'];
