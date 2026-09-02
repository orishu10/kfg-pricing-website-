export const CURRENCY_OPTIONS = ['ILS', 'USD', 'EUR'];
export const INCOTERMS = ['fob', 'cif', 'dap', 'ddp'] as const;

export const ROUTE_KEYS = [
  'reference', 'agent', 'shipping_line', 'origin', 'destination',
  'origin_port', 'destination_port', 'container_type', 'tt', 'validity',
  'usd_rate', 'eur_rate',
  'fob_currency', 'fob_ils', 'fob_usd', 'fob_eur',
  'cif_currency', 'cif_ils', 'cif_usd', 'cif_eur',
  'dap_currency', 'dap_ils', 'dap_usd', 'dap_eur',
  'ddp_currency', 'ddp_ils', 'ddp_usd', 'ddp_eur',
] as const;

export type RouteForm = Record<(typeof ROUTE_KEYS)[number], string>;

export const EMPTY_ROUTE: RouteForm = {
  ...(Object.fromEntries(ROUTE_KEYS.map((k) => [k, ''])) as RouteForm),
  fob_currency: 'ILS',
  cif_currency: 'ILS',
  dap_currency: 'ILS',
  ddp_currency: 'ILS',
};
