import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCustomers, createCustomer, deleteCustomer } from '../../../api';

export const useCustomersPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const { data: customers = [], isError } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['customers'] });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      setNewId('');
      setNewName('');
      setShowForm(false);
      invalidate();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create customer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: invalidate,
    onError: () => setError('Failed to delete customer'),
  });

  const toggleForm = () => {
    setShowForm((v) => !v);
    setError('');
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({ id: newId.trim(), name: newName.trim() });
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete customer "${name}"? This will also remove all their supplier links and items.`)) return;
    setError('');
    deleteMutation.mutate(id);
  };

  return {
    customers,
    showForm,
    newId,
    setNewId,
    newName,
    setNewName,
    error: error || (isError ? 'Failed to load customers' : ''),
    toggleForm,
    handleAdd,
    handleDelete,
  };
};
