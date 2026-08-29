export const PRICING_STATUS = ['Active', 'Inactive'];
export const CONTAINER_OPTIONS = ['REF40HC', 'REF20HC', 'DRY40HC', 'DRY20HC'];
export const INCOTERMS_OPTIONS = ['FCA', 'FOB', 'CIF', 'DAP', 'DDP'];
export const CURRENCY_OPTIONS = ['USD', 'ILS', 'EUR', 'GBP'];
export const CURRENCY_PAIR_OPTIONS = ['ILS > US$', 'US$ > ILS'];

// Every field held in the pricing form's string-state (editable, read-only from
// the item, computed, or display-only). EMPTY seeds them all blank.
export const PRICING_KEYS = [
  // links + identity
  'customer_id', 'item_id', 'kfg_sku', 'status',
  // description / currency
  'currency', 'pack_size', 'currency_pair', 'ex_rate', 'ex_current',
  // read-only from item + display
  'unit_weight', 'units_in_case', 'cases_in_fcl', 'supplier_name', 'description',
  // log / route
  'cases_per_pallet', 'pallets_per_fcl', 'pallets', 'route', 'container_type', 'incoterms_supplier',
  'fob', 'cif', 'dap', 'ddp',
  // supplier pricing
  'supplier_price_unit', 'supplier_price_case', 'supplier_price_fcl', 'supplier_price_1kg',
  'price_unit_ils', 'price_unit_usd', 'price_case_ils', 'price_case_usd', 'price_fcl_usd',
  // cost build-up
  'sub_total_1', 'sub_total_2', 'us_tariff', 'us_tariff_pct', 'import_factor',
  'kfg_commission', 'kfg_commission_pct', 'kfg_commission_total', 'tariffs_total', 'total', 'usd_nis',
  'supervision_cost', 'supervision_fees',
  // final cost & price
  'cost_unit', 'cost_case', 'cost_1kg',
  'price_unit', 'price_case', 'price_1kg',
  'sap_price_unit', 'sap_price_case', 'sap_price_1kg',
] as const;

export type PricingForm = Record<(typeof PRICING_KEYS)[number], string>;

export const EMPTY_PRICING: PricingForm = Object.fromEntries(
  PRICING_KEYS.map((k) => [k, '']),
) as PricingForm;

// Text/identity fields — may stay empty (stored as NULL). Everything else is a
// numeric field that defaults to 0 when left blank (never empty).
export const TEXT_KEYS: readonly string[] = [
  'customer_id', 'item_id', 'kfg_sku', 'status',
  'currency', 'pack_size', 'currency_pair', 'route', 'container_type', 'incoterms_supplier',
  'supplier_name', 'description',
];

export const NUMERIC_KEYS: readonly string[] = PRICING_KEYS.filter((k) => !TEXT_KEYS.includes(k));
