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
  created_at: string;
}

export interface Supplier extends PartyProfile {
  id: string;
  name: string;
  created_at: string;
}

// What we SEND when creating/updating a customer or supplier
export interface PartyPayload extends PartyProfile {
  name: string;
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

// What we SEND to the server on PUT (numeric fields as number | null)
export interface ItemPayload {
  name: string;
  size: string | null;
  supplier_incoterms: string | null;
  customer_incoterms: string | null;
  logistics: number | null;
  container_type: string | null;
  fob: number | null;
  cif: number | null;
  dap: number | null;
  ddp: number | null;
  cases_in_fcl: number | null;
  units_in_case: number | null;
  unit_weight: number | null;
  cases_per_pallet: number | null;
  pallets_per_fcl: number | null;
  supplier_price_unit: number | null;
  supplier_price_case: number | null;
  supplier_price_fcl: number | null;
  supplier_price_1kg: number | null;
  sub_total_1: number | null;
  us_tariff: number | null;
  sub_total_2: number | null;
  import_factor: number | null;
  kfg_commission: number | null;
  total: number | null;
  kfg_commission_total: number | null;
  tariffs_total: number | null;
  usd_nis: number | null;
  cost_unit: number | null;
  cost_case: number | null;
  price_unit: number | null;
  price_case: number | null;
  sap_price_unit: number | null;
  sap_price_case: number | null;
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

// Items
export const getItems = async (supplierId?: string) =>
  (await api.get<Item[]>('/items', { params: supplierId ? { supplier_id: supplierId } : undefined })).data;
export const getItem = async (id: string) => (await api.get<Item>(`/items/${id}`)).data;
export const createItem = async (data: NewItem) => (await api.post<Item>('/items', data)).data;
export const updateItem = async (id: string, data: ItemPayload) =>
  (await api.put<Item>(`/items/${id}`, data)).data;
export const deleteItem = async (id: string) => api.delete(`/items/${id}`);

// Auth
export const login = async (username: string, password: string) =>
  (await api.post<{ token: string; username: string }>('/auth/login', { username, password })).data;
