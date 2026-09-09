import type { Route } from '../../../../api';

export const CURRENCY_OPTIONS = ['ILS', 'USD', 'EUR'];
export const CURRENCY_SYMBOLS: Record<string, string> = { ILS: '₪', USD: '$', EUR: '€' };
export const INCOTERMS = ['fob', 'cif', 'dap', 'ddp'] as const;

export const ROUTE_KEYS = [
  'reference', 'agent', 'shipping_line', 'origin', 'destination',
  'origin_port', 'destination_port', 'container_type', 'tt', 'validity',
  'usd_rate', 'eur_rate',
  'fob_currency', 'fob_ils', 'fob_usd', 'fob_eur',
  'cif_currency', 'cif_ils', 'cif_usd', 'cif_eur',
  'dap_currency', 'dap_ils', 'dap_usd', 'dap_eur',
  'ddp_currency', 'ddp_ils', 'ddp_usd', 'ddp_eur',
  'total_currency', 'total_cost',
] as const;

export type RouteForm = Record<(typeof ROUTE_KEYS)[number], string>;

export const EMPTY_ROUTE: RouteForm = {
  ...(Object.fromEntries(ROUTE_KEYS.map((k) => [k, ''])) as RouteForm),
  fob_currency: 'ILS',
  cif_currency: 'ILS',
  dap_currency: 'ILS',
  ddp_currency: 'ILS',
  total_currency: 'ILS',
};

export const ROUTE_FILE_MAX_BYTES = 10 * 1024 * 1024;

export const ROUTE_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg'];

export const ROUTE_FILE_ACCEPT = ROUTE_FILE_EXTENSIONS.map((extension) => `.${extension}`).join(',');

export const EXPIRY_WINDOW = 7;

export type ExpirySeverity = 'expired' | 'urgent' | 'soon';

export interface RouteExpiryAlert {
  route: Route;
  days: number;
}

export const EXPIRY_CHIP_STYLES: Record<ExpirySeverity, { bgcolor: string; color: string }> = {
  expired: { bgcolor: '#d32f2f', color: '#ffffff' },
  urgent: { bgcolor: '#ed6c02', color: '#ffffff' },
  soon: { bgcolor: '#ffe680', color: '#5a4700' },
};

export const EXPIRY_TEXT_COLORS: Record<ExpirySeverity, string> = {
  expired: '#d32f2f',
  urgent: '#ed6c02',
  soon: '#8a6d00',
};

export type Incoterm = (typeof INCOTERMS)[number];

export type RouteCurrency = 'ILS' | 'USD' | 'EUR';

export const ROUTE_CURRENCIES: RouteCurrency[] = ['ILS', 'USD', 'EUR'];

export const VALID_CHIP_STYLE = { bgcolor: '#e6efe1', color: '#2e7d32' };

export const EXPIRY_STAGE_LABELS: Record<string, string> = {
  week: 'week-out email sent',
  day: 'day-out email sent',
  expired: 'expiry email sent',
};

export const EXPIRY_GROUP_LABELS: Record<ExpirySeverity, string> = {
  expired: 'Expired',
  urgent: 'Due tomorrow',
  soon: 'This week',
};

export const EXPIRY_SEVERITY_ORDER: ExpirySeverity[] = ['expired', 'urgent', 'soon'];

export const FX_STALE_MS = 10 * 60 * 1000;
