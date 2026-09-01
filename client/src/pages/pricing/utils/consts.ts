export const PRICING_STATUS = ['Active', 'Inactive'];
export const CONTAINER_OPTIONS = ['REF40HC', 'REF20HC', 'DRY40HC', 'DRY20HC'];
export const INCOTERMS_OPTIONS = ['FCA', 'FOB', 'CIF', 'DAP', 'DDP'];
export const WEIGHT_UNIT_OPTIONS = ['KG', 'LB'];
export const CURRENCY_OPTIONS = ['USD', 'ILS', 'EUR', 'GBP'];
export const CURRENCY_PAIR_OPTIONS = ['ILS > USD', 'ILS > EUR'];

export const PRICING_KEYS = [
  'customer_id', 'item_id', 'kfg_sku', 'status',
  'currency', 'pack_size', 'currency_pair', 'ex_rate', 'ex_current',
  'unit_weight', 'units_in_case', 'cases_in_fcl', 'supplier_name', 'description',
  'cases_per_pallet', 'pallets_per_fcl', 'pallets', 'route', 'container_type', 'incoterms_supplier',
  'fob', 'cif', 'dap', 'ddp',
  'supplier_price_unit', 'supplier_price_case', 'supplier_price_fcl', 'supplier_price_1kg',
  'price_unit_ils', 'price_unit_usd', 'price_case_ils', 'price_case_usd', 'price_fcl_usd',
  'sub_total_1', 'sub_total_2', 'us_tariff', 'us_tariff_pct', 'import_factor',
  'kfg_commission', 'kfg_commission_pct', 'kfg_commission_total', 'tariffs_total', 'total', 'usd_nis',
  'supervision_cost', 'supervision_fees', 'supervision_cost_rate', 'supervision_fees_rate',
  'cost_unit', 'cost_case', 'cost_1kg',
  'price_unit', 'price_case', 'price_1kg',
  'sap_price_unit', 'sap_price_case', 'sap_price_1kg',
  'weight_unit',
] as const;

export type PricingForm = Record<(typeof PRICING_KEYS)[number], string>;

export const EMPTY_PRICING: PricingForm = Object.fromEntries(
  PRICING_KEYS.map((k) => [k, '']),
) as PricingForm;

export const TEXT_KEYS: readonly string[] = [
  'customer_id', 'item_id', 'kfg_sku', 'status',
  'currency', 'pack_size', 'currency_pair', 'route', 'container_type', 'incoterms_supplier',
  'supplier_name', 'description', 'weight_unit',
];

export const NUMERIC_KEYS: readonly string[] = PRICING_KEYS.filter((k) => !TEXT_KEYS.includes(k));
