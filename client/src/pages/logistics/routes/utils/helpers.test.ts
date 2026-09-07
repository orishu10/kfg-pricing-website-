import { describe, expect, it } from 'vitest';
import { EMPTY_ROUTE, type RouteForm } from './consts';
import { deriveRoute, groupAlertsBySeverity, incotermAmounts, routeTotals, validityChip, worstSeverity } from './helpers';
import type { Route } from '../../../../api';

const form: RouteForm = {
  ...EMPTY_ROUTE,
  usd_rate: '4',
  eur_rate: '5',
  fob_currency: 'ILS', fob_ils: '400',
  cif_currency: 'USD', cif_usd: '100',
  dap_currency: 'EUR', dap_eur: '20',
  ddp_currency: 'ILS', ddp_ils: '',
  total_currency: 'USD',
};

const routeWithValidity = (id: string, validity: string | null): Route =>
  ({ id, validity, reference: null, agent: null, shipping_line: null, origin: null, destination: null } as unknown as Route);

describe('incotermAmounts', () => {
  it('converts an ILS price into USD and EUR using the rates', () => {
    expect(incotermAmounts(form, 'fob')).toEqual({ ILS: 400, USD: 100, EUR: 80 });
  });

  it('converts a USD price into ILS and EUR', () => {
    expect(incotermAmounts(form, 'cif')).toEqual({ USD: 100, ILS: 400, EUR: 80 });
  });

  it('converts a EUR price into ILS and USD', () => {
    expect(incotermAmounts(form, 'dap')).toEqual({ EUR: 20, ILS: 100, USD: 25 });
  });

  it('returns null conversions when a rate is missing', () => {
    expect(incotermAmounts({ ...form, eur_rate: '' }, 'fob').EUR).toBeNull();
  });
});

describe('routeTotals and deriveRoute', () => {
  it('sums every incoterm in all three currencies', () => {
    expect(routeTotals(form)).toEqual({ ILS: 900, USD: 225, EUR: 180 });
  });

  it('fills the derived currency fields and the total in the chosen currency', () => {
    const derived = deriveRoute(form);
    expect(derived.fob_usd).toBe('100.00');
    expect(derived.fob_eur).toBe('80.00');
    expect(derived.cif_ils).toBe('400.00');
    expect(derived.total_cost).toBe('225.00');
    expect(derived.fob_ils).toBeUndefined();
  });
});

describe('expiry helpers', () => {
  it('reports the worst severity and groups alerts in order', () => {
    const alerts = [
      { route: routeWithValidity('a', null), days: 5 },
      { route: routeWithValidity('b', null), days: -2 },
      { route: routeWithValidity('c', null), days: 1 },
    ];
    expect(worstSeverity(alerts)).toBe('expired');
    expect(groupAlertsBySeverity(alerts).map((group) => group.severity)).toEqual(['expired', 'urgent', 'soon']);
    expect(worstSeverity([])).toBeNull();
  });

  it('describes validity as a chip only when a date is set', () => {
    expect(validityChip(null)).toBeNull();
    expect(validityChip(35)?.label).toBe('35 days left');
    expect(validityChip(3)?.label).toBe('3d');
    expect(validityChip(-1)?.label).toBe('Expired');
  });
});
