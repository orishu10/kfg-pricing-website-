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

export interface Item {
  id: string;
  name: string;
  customer_id: string;
  supplier_id: number;
  final_price: string | null;
  created_at: string;
}

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
export const createItem = (data: {
  id: string;
  name: string;
  customer_id: string;
  supplier_id: number;
  final_price?: number | null;
}) => api.post<Item>('/items', data).then(r => r.data);
export const updateItem = (id: string, data: { name: string; final_price?: number | null }) =>
  api.put<Item>(`/items/${id}`, data).then(r => r.data);
export const deleteItem = (id: string) => api.delete(`/items/${id}`);
