import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export default api;

// Shared profile fields — customers and suppliers have the identical field set.
export interface PartyProfile {
  short_name: string | null;
  phone: string | null;
  incoterms: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  country: string | null;
}

export interface Customer extends PartyProfile {
  id: string;
  name: string;
  currency: string | null; // USD / EUR / ILS — drives the pricing form
  created_at: string;
}

export interface Supplier extends PartyProfile {
  id: string;
  name: string;
  created_at: string;
}

// currency is customer-only; suppliers leave it undefined.
export interface PartyPayload extends PartyProfile {
  name: string;
  currency?: string | null;
}

export type N = string | null; // numeric fields come back as strings from pg

export interface Item {
  // Identity
  id: string;
  name: string;
  supplier_id: string;
  supplier_name?: string;
  size: string | null;
  created_at: string;
  updated_at: string | null;

  // Terms
  supplier_incoterms: string | null;
  customer_incoterms: string | null;

  // Logistics
  logistics: N;
  container_type: string | null;

  // Incoterm prices
  fob: N;
  cif: N;
  dap: N;
  ddp: N;

  // Volume / weight
  cases_in_fcl: number | null;
  units_in_case: number | null;
  unit_weight: N;
  cases_per_pallet: number | null;
  pallets_per_fcl: number | null;

  // Supplier pricing
  supplier_price_unit: N;
  supplier_price_case: N;
  supplier_price_fcl: N;
  supplier_price_1kg: N;

  // Cost build-up
  sub_total_1: N;
  us_tariff: N;
  sub_total_2: N;
  import_factor: N;
  kfg_commission: N;
  total: N;
  kfg_commission_total: N;
  tariffs_total: N;
  usd_nis: N;

  // Final cost & price
  cost_unit: N;
  cost_case: N;
  price_unit: N;
  price_case: N;
  sap_price_unit: N;
  sap_price_case: N;
}

// New-item form fields (id is auto-generated server-side)
export interface NewItem {
  name: string;
  supplier_id: string;
  size: string | null;
  unit_weight: number | null;
  units_in_case: number | null;
  cases_in_fcl: number | null;
}

// Customers
export const getCustomers = async () => (await api.get<Customer[]>('/customers')).data;
export const getCustomer = async (id: string) => (await api.get<Customer>(`/customers/${id}`)).data;
export const createCustomer = async (data: { id: string } & PartyPayload) =>
  (await api.post<Customer>('/customers', data)).data;
export const updateCustomer = async (id: string, data: PartyPayload) =>
  (await api.put<Customer>(`/customers/${id}`, data)).data;
export const deleteCustomer = async (id: string) => api.delete(`/customers/${id}`);

// Suppliers
export const getSuppliers = async () => (await api.get<Supplier[]>('/suppliers')).data;
export const getSupplier = async (id: string) => (await api.get<Supplier>(`/suppliers/${id}`)).data;
export const createSupplier = async (data: { id: string } & PartyPayload) =>
  (await api.post<Supplier>('/suppliers', data)).data;
export const updateSupplier = async (id: string, data: PartyPayload) =>
  (await api.put<Supplier>(`/suppliers/${id}`, data)).data;
export const deleteSupplier = async (id: string) => api.delete(`/suppliers/${id}`);

// DBM item catalog fields (pricing lives in the Pricing module)
export interface ItemUpdate {
  name: string;
  supplier_id: string;
  size: string | null;
  unit_weight: number | null;
  units_in_case: number | null;
  cases_in_fcl: number | null;
}

// Items
export const getItems = async (supplierId?: string) =>
  (await api.get<Item[]>('/items', { params: supplierId ? { supplier_id: supplierId } : undefined })).data;
export const getItem = async (id: string) => (await api.get<Item>(`/items/${id}`)).data;
export const createItem = async (data: NewItem) => (await api.post<Item>('/items', data)).data;
export const updateItem = async (id: string, data: ItemUpdate) =>
  (await api.put<Item>(`/items/${id}`, data)).data;
export const deleteItem = async (id: string) => api.delete(`/items/${id}`);

// Pricing — a customer × item cost/price record (numeric cols are strings, like Item).
export interface Pricing {
  id: string;
  customer_id: string;
  item_id: string;
  kfg_sku: string | null;
  status: string | null;

  // joined (read-only)
  customer_name?: string;
  supplier_name?: string;
  description?: string;
  size?: string | null;

  currency: string | null;
  pack_size: string | null;
  currency_pair: string | null;
  ex_rate: N;

  unit_weight: N;
  units_in_case: number | null;
  cases_in_fcl: number | null;
  cases_per_pallet: number | null;
  pallets_per_fcl: number | null;
  pallets: number | null;
  route: string | null;
  container_type: string | null;
  incoterms_supplier: string | null;

  fob: N; cif: N; dap: N; ddp: N;

  supplier_price_unit: N;
  supplier_price_case: N;
  supplier_price_fcl: N;
  supplier_price_1kg: N;
  price_unit_ils: N;
  price_unit_usd: N;
  price_case_ils: N;
  price_case_usd: N;
  price_fcl_usd: N;

  sub_total_1: N;
  sub_total_2: N;
  us_tariff: N;
  us_tariff_pct: N;
  import_factor: N;
  kfg_commission: N;
  kfg_commission_pct: N;
  kfg_commission_total: N;
  tariffs_total: N;
  total: N;
  usd_nis: N;
  supervision_cost: N;
  supervision_fees: N;
  supervision_cost_rate: N;
  supervision_fees_rate: N;

  cost_unit: N; cost_case: N; cost_1kg: N;
  price_unit: N; price_case: N; price_1kg: N;
  sap_price_unit: N; sap_price_case: N; sap_price_1kg: N;
  weight_unit: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
}

// customer_id + item_id are required; other fields are form strings.
export type PricingInput = { customer_id: string; item_id: string } & Record<
  string,
  string | number | null | undefined
>;

export const getPricings = async () => (await api.get<Pricing[]>('/pricing')).data;
export const getPricing = async (id: string) => (await api.get<Pricing>(`/pricing/${id}`)).data;
export const createPricing = async (data: PricingInput) =>
  (await api.post<Pricing>('/pricing', data)).data;
export const updatePricing = async (id: string, data: PricingInput) =>
  (await api.put<Pricing>(`/pricing/${id}`, data)).data;
export const deletePricing = async (id: string) => api.delete(`/pricing/${id}`);

export interface Route {
  id: string;
  reference: string | null;
  agent: string | null;
  shipping_line: string | null;
  origin: string | null;
  destination: string | null;
  origin_port: string | null;
  destination_port: string | null;
  container_type: string | null;
  tt: string | null;
  validity: string | null;

  usd_rate: N;
  eur_rate: N;

  fob_currency: string | null; fob_ils: N; fob_usd: N; fob_eur: N;
  cif_currency: string | null; cif_ils: N; cif_usd: N; cif_eur: N;
  dap_currency: string | null; dap_ils: N; dap_usd: N; dap_eur: N;
  ddp_currency: string | null; ddp_ils: N; ddp_usd: N; ddp_eur: N;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export type RouteInput = Record<string, string | number | null | undefined>;

export const getRoutes = async () => (await api.get<Route[]>('/routes')).data;
export const getRoute = async (id: string) => (await api.get<Route>(`/routes/${id}`)).data;
export const createRoute = async (data: RouteInput) =>
  (await api.post<Route>('/routes', data)).data;
export const updateRoute = async (id: string, data: RouteInput) =>
  (await api.put<Route>(`/routes/${id}`, data)).data;
export const deleteRoute = async (id: string) => api.delete(`/routes/${id}`);

export interface WeeklyShipment {
  id: string;
  con: string | null;
  customer: string | null;
  supplier: string | null;
  description: string | null;
  pup: string | null;
  pol: string | null;
  pod: string | null;
  vessel: string | null;
  voyage: string | null;
  etd: string | null;
  eta: string | null;
  booked: boolean;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export type WeeklyShipmentInput = Record<string, string | number | boolean | null | undefined>;

export const getWeeklyShipments = async () =>
  (await api.get<WeeklyShipment[]>('/weekly-shipments')).data;
export const getWeeklyShipment = async (id: string) =>
  (await api.get<WeeklyShipment>(`/weekly-shipments/${id}`)).data;
export const createWeeklyShipment = async (data: WeeklyShipmentInput) =>
  (await api.post<WeeklyShipment>('/weekly-shipments', data)).data;
export const updateWeeklyShipment = async (id: string, data: WeeklyShipmentInput) =>
  (await api.put<WeeklyShipment>(`/weekly-shipments/${id}`, data)).data;
export const deleteWeeklyShipment = async (id: string) => api.delete(`/weekly-shipments/${id}`);

export interface Schedule {
  id: string;
  vessel: string | null;
  voyage: string | null;
  pol: string | null;
  pod: string | null;
  etd: string | null;
  eta: string | null;
  tt: string | null;
  ddl_con: string | null;
  ddl_docs: string | null;
  ddl_port: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export type ScheduleInput = Record<string, string | number | null | undefined>;

export const getSchedules = async () => (await api.get<Schedule[]>('/schedules')).data;
export const getSchedule = async (id: string) => (await api.get<Schedule>(`/schedules/${id}`)).data;
export const createSchedule = async (data: ScheduleInput) =>
  (await api.post<Schedule>('/schedules', data)).data;
export const updateSchedule = async (id: string, data: ScheduleInput) =>
  (await api.put<Schedule>(`/schedules/${id}`, data)).data;
export const deleteSchedule = async (id: string) => api.delete(`/schedules/${id}`);

export interface FxRates {
  USD: number | null;
  EUR: number | null;
}

export const getFxRates = async () => (await api.get<FxRates>('/fx')).data;

// Auth
export const login = async (username: string, password: string) =>
  (await api.post<{ token: string; username: string }>('/auth/login', { username, password })).data;
