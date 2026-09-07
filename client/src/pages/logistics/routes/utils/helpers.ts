import {
  EMPTY_ROUTE,
  ROUTE_KEYS,
  INCOTERMS,
  EXPIRY_WINDOW,
  EXPIRY_CHIP_STYLES,
  EXPIRY_SEVERITY_ORDER,
  VALID_CHIP_STYLE,
  type Incoterm,
  type RouteCurrency,
  type RouteForm,
  type ExpirySeverity,
  type RouteExpiryAlert,
} from './consts';
import type { Route } from '../../../../api';

export const routeToForm = (r: Route): RouteForm => {
  const out = { ...EMPTY_ROUTE };
  ROUTE_KEYS.forEach((k) => {
    const v = (r as unknown as Record<string, unknown>)[k];
    out[k] = v == null ? '' : String(v);
  });
  if (out.validity) out.validity = out.validity.slice(0, 10);
  return { ...out, ...deriveRoute(out) };
};

export interface IncotermAmounts {
  ILS: number | null;
  USD: number | null;
  EUR: number | null;
}

const numberOf = (f: RouteForm, k: keyof RouteForm) => parseFloat(f[k]) || 0;

export const incotermCurrency = (f: RouteForm, x: Incoterm): RouteCurrency =>
  ((f[`${x}_currency` as keyof RouteForm] || 'ILS').toUpperCase() as RouteCurrency);

export const incotermAmounts = (f: RouteForm, x: Incoterm): IncotermAmounts => {
  const usdRate = numberOf(f, 'usd_rate');
  const eurRate = numberOf(f, 'eur_rate');
  const cur = incotermCurrency(f, x);

  if (cur === 'USD') {
    const usd = numberOf(f, `${x}_usd` as keyof RouteForm);
    return { USD: usd, ILS: usd * usdRate, EUR: eurRate > 0 ? (usd * usdRate) / eurRate : null };
  }
  if (cur === 'EUR') {
    const eur = numberOf(f, `${x}_eur` as keyof RouteForm);
    return { EUR: eur, ILS: eur * eurRate, USD: usdRate > 0 ? (eur * eurRate) / usdRate : null };
  }
  const ils = numberOf(f, `${x}_ils` as keyof RouteForm);
  return { ILS: ils, USD: usdRate > 0 ? ils / usdRate : null, EUR: eurRate > 0 ? ils / eurRate : null };
};

export const routeTotals = (f: RouteForm): Record<RouteCurrency, number> => {
  const totals: Record<RouteCurrency, number> = { ILS: 0, USD: 0, EUR: 0 };
  INCOTERMS.forEach((x) => {
    const amounts = incotermAmounts(f, x);
    totals.ILS += amounts.ILS ?? 0;
    totals.USD += amounts.USD ?? 0;
    totals.EUR += amounts.EUR ?? 0;
  });
  return totals;
};

export const totalCurrency = (f: RouteForm): RouteCurrency =>
  ((f.total_currency || 'ILS').toUpperCase() as RouteCurrency);

export const deriveRoute = (f: RouteForm): Partial<RouteForm> => {
  const s = (v: number | null) => (v != null ? v.toFixed(2) : '');
  const out: Partial<RouteForm> = {};

  INCOTERMS.forEach((x) => {
    const cur = incotermCurrency(f, x);
    const amounts = incotermAmounts(f, x);
    if (cur !== 'ILS') out[`${x}_ils` as keyof RouteForm] = s(amounts.ILS);
    if (cur !== 'USD') out[`${x}_usd` as keyof RouteForm] = s(amounts.USD);
    if (cur !== 'EUR') out[`${x}_eur` as keyof RouteForm] = s(amounts.EUR);
  });

  out.total_cost = s(routeTotals(f)[totalCurrency(f)]);
  return out;
};

const toLocalDate = (iso: string): Date | null => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const daysUntil = (validity: string | null): number | null => {
  if (!validity) return null;
  const target = toLocalDate(validity);
  if (!target) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
};

export const isWithinExpiryWindow = (days: number) => days <= EXPIRY_WINDOW;

export const expirySeverity = (days: number): ExpirySeverity =>
  days < 0 ? 'expired' : days <= 1 ? 'urgent' : 'soon';

export const expiryChipLabel = (days: number): string => {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
};

export const expiryShortLabel = (days: number): string => {
  if (days < -1) return `${Math.abs(days)} days ago`;
  if (days === -1) return 'Yesterday';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
};

export const expiryMessage = (days: number): string => {
  if (days < -1) return `Expired ${Math.abs(days)} days ago`;
  if (days === -1) return 'Expired yesterday';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} days`;
};

export const expiryAlerts = (routes: Route[]): RouteExpiryAlert[] =>
  routes
    .map((route) => ({ route, days: daysUntil(route.validity) }))
    .filter((alert): alert is RouteExpiryAlert => alert.days != null && isWithinExpiryWindow(alert.days))
    .sort((a, b) => a.days - b.days);

export const worstSeverity = (alerts: RouteExpiryAlert[]): ExpirySeverity | null => {
  const present = new Set(alerts.map((alert) => expirySeverity(alert.days)));
  return EXPIRY_SEVERITY_ORDER.find((severity) => present.has(severity)) ?? null;
};

export const groupAlertsBySeverity = (alerts: RouteExpiryAlert[]) =>
  EXPIRY_SEVERITY_ORDER
    .map((severity) => ({ severity, alerts: alerts.filter((alert) => expirySeverity(alert.days) === severity) }))
    .filter((group) => group.alerts.length > 0);

export const validityChip = (days: number | null): { label: string; styles: { bgcolor: string; color: string } } | null => {
  if (days == null) return null;
  if (isWithinExpiryWindow(days)) return { label: expiryChipLabel(days), styles: EXPIRY_CHIP_STYLES[expirySeverity(days)] };
  return { label: `${days} days left`, styles: VALID_CHIP_STYLE };
};

export const routeLane = (route: Route): string =>
  [
    [route.origin, route.destination].filter(Boolean).join(' → '),
    route.shipping_line,
    route.container_type,
  ]
    .filter(Boolean)
    .join(' · ');

export const routeTitle = (route: Route): string => route.reference || route.shipping_line || `Route ${route.id}`;
