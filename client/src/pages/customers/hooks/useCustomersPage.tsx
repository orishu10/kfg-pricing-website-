import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  type Customer, type PartyPayload,
} from '../../../api';

export const useCustomersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: customers = [], isError } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['customers'] });

  const onError = (fallback: string) => (err: unknown) => {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(msg || fallback);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setError('');
  };

  const createMutation = useMutation({
    mutationFn: (data: { id: string } & PartyPayload) => createCustomer(data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: onError('Failed to create customer'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartyPayload }) => updateCustomer(id, data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: onError('Failed to update customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: invalidate,
    onError: () => setError('Failed to delete customer'),
  });

  const openAdd = () => { setEditing(null); setError(''); setDialogOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setError(''); setDialogOpen(true); };

  const handleSubmit = (id: string, data: PartyPayload) => {
    setError('');
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate({ id, ...data });
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const q = search.toLowerCase();
  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
  );

  return {
    customers: filtered,
    search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error: error || (isError ? 'Failed to load customers' : ''),
    handleSubmit,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
