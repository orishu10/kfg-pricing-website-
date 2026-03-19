export interface FormState {
  name: string;
  supplier_incoterms: string;
  customer_incoterms: string;
  logistics: string;
  container_type: string;
  fob: string;
  cif: string;
  dap: string;
  ddp: string;
  cases_in_fcl: string;
  units_in_case: string;
  pallets_per_fcl: string,cases_per_pallets : string,
    unit_weight: string;
supplier_price_unit: string;
supplier_price_case: string;
supplier_price_fcl: string;
supplier_price_1kg: string;
sub_total_1: string;
us_tariff: string;
sub_total_2: string;
import_factor: string;
kfg_commission: string;
total: string;
cost_unit: string;
cost_case: string;
price_unit: string;
price_case: string;
sap_price_unit: string;
sap_price_case: string;
}
