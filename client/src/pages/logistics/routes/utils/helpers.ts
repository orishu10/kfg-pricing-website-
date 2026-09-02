import {
  EMPTY_ROUTE,
  ROUTE_KEYS,
  INCOTERMS,
  EXPIRY_WINDOW,
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

export const deriveRoute = (f: RouteForm): Partial<RouteForm> => {
  const num = (k: keyof RouteForm) => parseFloat(f[k]) || 0;
  const usdRate = num('usd_rate');
  const eurRate = num('eur_rate');
  const s = (v: number | null) => (v != null ? v.toFixed(4) : '');

  const out: Partial<RouteForm> = {};
  const totals = { ILS: 0, USD: 0, EUR: 0 };

  INCOTERMS.forEach((x) => {
    const cur = (f[`${x}_currency` as keyof RouteForm] || 'ILS').toUpperCase();
    const ilsK = `${x}_ils` as keyof RouteForm;
    const usdK = `${x}_usd` as keyof RouteForm;
    const eurK = `${x}_eur` as keyof RouteForm;

    let ils: number | null = null;
    let usd: number | null = null;
    let eur: number | null = null;

    if (cur === 'USD') {
      usd = num(usdK);
      ils = usd * usdRate;
      eur = eurRate > 0 ? (usd * usdRate) / eurRate : null;
    } else if (cur === 'EUR') {
      eur = num(eurK);
      ils = eur * eurRate;
      usd = usdRate > 0 ? (eur * eurRate) / usdRate : null;
    } else {
      ils = num(ilsK);
      usd = usdRate > 0 ? ils / usdRate : null;
      eur = eurRate > 0 ? ils / eurRate : null;
    }

    if (cur !== 'ILS') out[ilsK] = s(ils);
    if (cur !== 'USD') out[usdK] = s(usd);
    if (cur !== 'EUR') out[eurK] = s(eur);

    totals.ILS += ils ?? 0;
    totals.USD += usd ?? 0;
    totals.EUR += eur ?? 0;
  });

  const totalCurrency = (f.total_currency || 'ILS').toUpperCase() as keyof typeof totals;
  out.total_cost = s(totals[totalCurrency]);
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
