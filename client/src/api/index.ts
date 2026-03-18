import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

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

  // Final cost & price
  cost_unit: N;
  cost_case: N;
  price_unit: N;
  price_case: N;
  sap_price_unit: N;
  sap_price_case: N;
}

export type ItemUpdate = Omit<Item,
  'id' | 'customer_id' | 'supplier_id' | 'supplier_name' | 'customer_name' | 'created_at' | 'updated_at'
>;

// Customers
export const getCustomers = () => api.get<Customer[]>('/customers').then(r => r.data);
export const getCustomer = (id: string) => api.get<Customer>(`/customers/${id}`).then(r => r.data);
export const createCustomer = (data: { id: string; name: string }) =>
  api.post<Customer>('/customers', data).then(r => r.data);
export const updateCustomer = (id: string, data: { name: string }) =>
  api.put<Customer>(`/customers/${id}`, data).then(r => r.data);
export const deleteCustomer = (id: string) => api.delete(`/customers/${id}`);
export const getCustomerSuppliers = (customerId: string) =>
  api.get<Supplier[]>(`/customers/${customerId}/suppliers`).then(r => r.data);

// Suppliers
export const getAllSuppliers = () => api.get<Supplier[]>('/suppliers').then(r => r.data);
export const createSupplier = (data: { name: string; customer_id?: string }) =>
  api.post<Supplier>('/suppliers', data).then(r => r.data);
export const linkSupplierToCustomer = (supplierId: number, customerId: string) =>
  api.post(`/suppliers/${supplierId}/link/${customerId}`);
export const getSupplierItems = (supplierId: number, customerId: string) =>
  api.get<Item[]>(`/suppliers/${supplierId}/items?customer_id=${customerId}`).then(r => r.data);

// Items
export const getItem = (id: string) => api.get<Item>(`/items/${id}`).then(r => r.data);
export const createItem = (data: { id: string; name: string; customer_id: string; supplier_id: number }) =>
  api.post<Item>('/items', data).then(r => r.data);
export const updateItem = (id: string, data: ItemUpdate) =>
  api.put<Item>(`/items/${id}`, data).then(r => r.data);
export const deleteItem = (id: string) => api.delete(`/items/${id}`);
