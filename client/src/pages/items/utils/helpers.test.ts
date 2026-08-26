import { describe, it, expect } from 'vitest';
import { calcDerived } from './helpers';
import type { FormState } from './types';

// A FormState where every field is blank. Tests override only the inputs
// they care about, so each case reads as "given these inputs, expect this".
const blankForm = (): FormState => ({
  name: '',
  size: '',
  supplier_incoterms: '',
  customer_incoterms: '',
  logistics: '',
  container_type: '',
  fob: '',
  cif: '',
  dap: '',
  ddp: '',
  cases_in_fcl: '',
  units_in_case: '',
  unit_weight: '',
  cases_per_pallet: '',
  pallets_per_fcl: '',
  supplier_price_unit: '',
  supplier_price_case: '',
  supplier_price_fcl: '',
  supplier_price_1kg: '',
  sub_total_1: '',
  us_tariff: '',
  sub_total_2: '',
  import_factor: '',
  kfg_commission: '',
  total: '',
  kfg_commission_total: '',
  tariffs_total: '',
  usd_nis: '',
  cost_unit: '',
  cost_case: '',
  price_unit: '',
  price_case: '',
  sap_price_unit: '',
  sap_price_case: '',
});

describe('calcDerived', () => {
  it('computes the full pricing chain from a complete set of inputs', () => {
    const form: FormState = {
      ...blankForm(),
      supplier_price_unit: '2',
      units_in_case: '10',
      unit_weight: '0.5',
      pallets_per_fcl: '20',
      cases_per_pallet: '5',
      fob: '100',
      cif: '50',
      us_tariff: '0.1',
      kfg_commission: '25',
    };

    expect(calcDerived(form)).toEqual({
      cases_in_fcl: '100', // pallets_per_fcl * cases_per_pallet
      supplier_price_case: '20.0000', // unit * units_in_case
      supplier_price_fcl: '2000.0000', // case * cases_in_fcl
      supplier_price_1kg: '4.0000', // unit / unit_weight
      sub_total_1: '2150.0000', // (fob+cif+dap+ddp) + supplier_fcl
      sub_total_2: '2150.1000', // sub_total_1 + us_tariff
      import_factor: '0.0750', // incoSum / supplier_fcl
      kfg_commission_total: '2175.0000', // kfg + sub_total_1
      tariffs_total: '200.0000', // supplier_fcl * us_tariff
      total: '2175.1000', // sub_total_2 + kfg
      cost_case: '21.5010', // sub_total_2 / cases_in_fcl
      cost_unit: '2.1501', // cost_case / units_in_case
      price_case: '21.7510', // total / cases_in_fcl
      price_unit: '2.1751', // price_case / units_in_case
      sap_price_unit: '2.0000', // supplier_price_case / units_in_case
    });
  });

  it('returns every derived field blank when nothing is entered', () => {
    const result = calcDerived(blankForm());
    for (const value of Object.values(result)) {
      expect(value).toBe('');
    }
  });

  it('computes incoterm subtotals even with no supplier pricing, but leaves per-case costs blank', () => {
    const form: FormState = { ...blankForm(), fob: '100', cif: '50' };
    const result = calcDerived(form);

    // Incoterm sums still resolve...
    expect(result.sub_total_1).toBe('150.0000');
    expect(result.sub_total_2).toBe('150.0000');
    // ...but anything needing cases_in_fcl / supplier FCL stays blank.
    expect(result.cases_in_fcl).toBe('');
    expect(result.supplier_price_fcl).toBe('');
    expect(result.import_factor).toBe('');
    expect(result.cost_case).toBe('');
    expect(result.price_case).toBe('');
  });

  it('guards against divide-by-zero: import_factor is blank when supplier FCL is zero', () => {
    // supplier_price_unit is 0, so supplier FCL is null → import_factor undefined.
    const form: FormState = {
      ...blankForm(),
      fob: '100',
      pallets_per_fcl: '20',
      cases_per_pallet: '5',
      units_in_case: '10',
    };
    expect(calcDerived(form).import_factor).toBe('');
  });

  it('only computes tariffs_total when a tariff is present', () => {
    const base: FormState = {
      ...blankForm(),
      supplier_price_unit: '2',
      units_in_case: '10',
      pallets_per_fcl: '20',
      cases_per_pallet: '5',
    };
    expect(calcDerived(base).tariffs_total).toBe(''); // no us_tariff
    expect(calcDerived({ ...base, us_tariff: '0.1' }).tariffs_total).toBe('200.0000');
  });

  it('ignores non-numeric input rather than producing NaN', () => {
    const form: FormState = {
      ...blankForm(),
      supplier_price_unit: 'abc',
      units_in_case: '10',
    };
    // 'abc' parses to NaN → coerced to 0 → supplier_price_case stays blank.
    expect(calcDerived(form).supplier_price_case).toBe('');
  });
});
