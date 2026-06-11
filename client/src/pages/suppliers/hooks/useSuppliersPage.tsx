import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCustomer, getCustomerSuppliers, getAllSuppliers,
  createSupplier, linkSupplierToCustomer,
} from '../../../api';

export const useSuppliersPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState(0);
  const [newName, setNewName] = useState('');
  const [linkId, setLinkId] = useState('');
  const [error, setError] = useState('');

  const customerQuery = useQuery({
    queryKey: ['customers', customerId],
    queryFn: () => getCustomer(customerId!),
  });

  const suppliersQuery = useQuery({
    queryKey: ['customers', customerId, 'suppliers'],
    queryFn: () => getCustomerSuppliers(customerId!),
  });

  const allSuppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: getAllSuppliers,
  });

  useEffect(() => {
    if (customerQuery.isError) navigate('/customers');
  }, [customerQuery.isError, navigate]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['customers', customerId, 'suppliers'] });
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
  };

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      setNewName('');
      setShowForm(false);
      invalidate();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create supplier');
    },
  });

  const linkMutation = useMutation({
    mutationFn: (supplierId: number) => linkSupplierToCustomer(supplierId, customerId!),
    onSuccess: () => {
      setLinkId('');
      setShowForm(false);
      invalidate();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to link supplier');
    },
  });

  const toggleForm = () => {
    setShowForm((v) => !v);
    setError('');
  };

  const handleAddNew = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({ name: newName.trim(), customer_id: customerId });
  };

  const handleLinkExisting = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    linkMutation.mutate(Number(linkId));
  };

  const suppliers = suppliersQuery.data ?? [];
  const allSuppliers = allSuppliersQuery.data ?? [];
  const linkedIds = new Set(suppliers.map((s) => s.id));
  const unlinkableSuppliers = allSuppliers.filter((s) => !linkedIds.has(s.id));

  return {
    customerId,
    customer: customerQuery.data ?? null,
    suppliers,
    unlinkableSuppliers,
    showForm,
    tab,
    setTab,
    newName,
    setNewName,
    linkId,
    setLinkId,
    error: error || (suppliersQuery.isError ? 'Failed to load suppliers' : ''),
    toggleForm,
    handleAddNew,
    handleLinkExisting,
  };
};
