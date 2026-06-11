import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCustomer, getCustomerSuppliers, getSupplierItems, createItem,
} from '../../../api';

export const useItemsPage = () => {
  const { customerId, supplierId } = useParams<{ customerId: string; supplierId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const customerQuery = useQuery({
    queryKey: ['customers', customerId],
    queryFn: () => getCustomer(customerId!),
  });

  const suppliersQuery = useQuery({
    queryKey: ['customers', customerId, 'suppliers'],
    queryFn: () => getCustomerSuppliers(customerId!),
  });

  const itemsQuery = useQuery({
    queryKey: ['items', customerId, supplierId],
    queryFn: () => getSupplierItems(Number(supplierId), customerId!),
  });

  const supplier = suppliersQuery.data?.find((s) => s.id === Number(supplierId)) ?? null;

  useEffect(() => {
    if (customerQuery.isError) navigate('/customers');
    else if (suppliersQuery.isSuccess && !supplier) navigate(`/customers/${customerId}/suppliers`);
  }, [customerQuery.isError, suppliersQuery.isSuccess, supplier, customerId, navigate]);

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      setNewId('');
      setNewName('');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['items', customerId, supplierId] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create item');
    },
  });

  const toggleForm = () => {
    setShowForm((v) => !v);
    setError('');
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({
      id: newId.trim(),
      name: newName.trim(),
      customer_id: customerId!,
      supplier_id: Number(supplierId),
    });
  };

  return {
    customerId,
    customer: customerQuery.data ?? null,
    supplier,
    items: itemsQuery.data ?? [],
    showForm,
    newId,
    setNewId,
    newName,
    setNewName,
    error: error || (itemsQuery.isError ? 'Failed to load items' : ''),
    toggleForm,
    handleAdd,
  };
};
