import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_PRICING, type PricingForm } from './consts';
import {
  currencyPair, currencyPairSides, derivePricing, exRateUnit, fetchFxRate, isSameCurrencyPair,
} from './helpers';

const getFxRates = vi.hoisted(() => vi.fn());

vi.mock('../../../api', () => ({ getFxRates }));

const form: PricingForm = {
  ...EMPTY_PRICING,
  supplier_price_unit: '36.50',
  units_in_case: '10',
  cases_in_fcl: '100',
  currency_pair: 'ILS > USD',
  ex_rate: '3.65',
};

describe('currencyPair', () => {
  it('reads supplier currency first, customer currency second', () => {
    expect(currencyPair('EUR', 'USD')).toBe('EUR > USD');
    expect(currencyPairSides('EUR > USD')).toEqual(['EUR', 'USD']);
  });

  it('falls back to shekels for a supplier with no currency set', () => {
    expect(currencyPair(null, 'USD')).toBe('ILS > USD');
  });

  it('has no pair until a customer is picked', () => {
    expect(currencyPair('USD', '')).toBe('');
  });

  it('spots a same-currency pair', () => {
    expect(isSameCurrencyPair('EUR > EUR')).toBe(true);
    expect(isSameCurrencyPair('ILS > USD')).toBe(false);
    expect(isSameCurrencyPair('')).toBe(false);
  });

  it('labels the rate with its direction', () => {
    expect(exRateUnit('ILS > USD')).toBe('₪/$');
    expect(exRateUnit('')).toBe('');
  });
});

describe('fetchFxRate', () => {
  beforeEach(() => getFxRates.mockReset().mockResolvedValue({ USD: 3.65, EUR: 4 }));

  it('quotes supplier currency per one unit of customer currency', async () => {
    await expect(fetchFxRate('ILS > USD')).resolves.toBe(3.65);
  });

  it('inverts the shekel rate when the supplier bills in dollars', async () => {
    await expect(fetchFxRate('USD > ILS')).resolves.toBeCloseTo(1 / 3.65, 10);
  });

  it('crosses two foreign currencies through the shekel', async () => {
    await expect(fetchFxRate('USD > EUR')).resolves.toBeCloseTo(4 / 3.65, 10);
  });

  it('needs no conversion when both sides match', async () => {
    await expect(fetchFxRate('EUR > EUR')).resolves.toBe(1);
    expect(getFxRates).not.toHaveBeenCalled();
  });
});

describe('derivePricing currency conversion', () => {
  it('keeps the supplier case price in the supplier currency', () => {
    expect(derivePricing(form).supplier_price_case).toBe('365.00');
  });

  it('converts the supplier price into the customer currency by the ex rate', () => {
    const derived = derivePricing(form);
    expect(derived.price_unit_usd).toBe('10.00');
    expect(derived.price_case_usd).toBe('100.00');
    expect(derived.price_fcl_usd).toBe('10000.00');
  });

  it('adds the converted supplier price to the route incoterms, never the raw one', () => {
    const derived = derivePricing({ ...form, fob: '500' });
    expect(derived.sub_total_1).toBe('10500.00');
  });

  it('leaves the converted fields empty and converts at 1 when both sides match', () => {
    const derived = derivePricing({ ...form, currency_pair: 'USD > USD', ex_rate: '' });
    expect(derived.price_unit_usd).toBe('');
    expect(derived.price_case_usd).toBe('');
    expect(derived.price_fcl_usd).toBe('36500.00');
  });
});
