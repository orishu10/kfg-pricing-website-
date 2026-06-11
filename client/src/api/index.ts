import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export default api;

export interface Customer {
  id: string;
  name: string;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  created_at: string;
}

export type N = string | null; // numeric fields come back as strings from pg

export interface Item {
  // Identity
  id: string;
  name: string;
  customer_id: string;
  supplier_id: number;
  supplier_name?: string;
  customer_name?: string;
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

// Customers
export const getCustomers = async () => (await api.get<Customer[]>('/customers')).data;
export const getCustomer = async (id: string) => (await api.get<Customer>(`/customers/${id}`)).data;
export const createCustomer = async (data: { id: string; name: string }) =>
  (await api.post<Customer>('/customers', data)).data;
export const updateCustomer = async (id: string, data: { name: string }) =>
  (await api.put<Customer>(`/customers/${id}`, data)).data;
export const deleteCustomer = async (id: string) => api.delete(`/customers/${id}`);
export const getCustomerSuppliers = async (customerId: string) =>
  (await api.get<Supplier[]>(`/customers/${customerId}/suppliers`)).data;

// Suppliers
export const getAllSuppliers = async () => (await api.get<Supplier[]>('/suppliers')).data;
export const createSupplier = async (data: { name: string; customer_id?: string }) =>
  (await api.post<Supplier>('/suppliers', data)).data;
export const linkSupplierToCustomer = async (supplierId: number, customerId: string) =>
  api.post(`/suppliers/${supplierId}/link/${customerId}`);
export const getSupplierItems = async (supplierId: number, customerId: string) =>
  (await api.get<Item[]>(`/suppliers/${supplierId}/items?customer_id=${customerId}`)).data;

// Items
export const getItem = async (id: string) => (await api.get<Item>(`/items/${id}`)).data;
export const createItem = async (data: { id: string; name: string; customer_id: string; supplier_id: number }) =>
  (await api.post<Item>('/items', data)).data;
export const updateItem = async (id: string, data: ItemPayload) =>
  (await api.put<Item>(`/items/${id}`, data)).data;
export const deleteItem = async (id: string) => api.delete(`/items/${id}`);

// Auth
export const login = async (username: string, password: string) =>
  (await api.post<{ token: string; username: string }>('/auth/login', { username, password })).data;
