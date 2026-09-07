import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../components';
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  type Customer, type PartyPayload,
} from '../../../api';

export const useCustomersPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
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
    onSuccess: (saved) => {
      closeDialog();
      invalidate();
      showToast({ title: `Customer ${saved.name} created` });
    },
    onError: onError('Failed to create customer'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartyPayload }) => updateCustomer(id, data),
    onSuccess: (saved) => {
      closeDialog();
      invalidate();
      showToast({ title: `Customer ${saved.name} saved` });
    },
    onError: onError('Failed to update customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; name: string }) => deleteCustomer(id),
    onSuccess: (_, { name }) => {
      invalidate();
      showToast({ title: `Customer ${name} deleted`, variant: 'info' });
    },
    onError: () => setError('Failed to delete customer'),
  });

  const openAdd = () => { setEditing(null); setError(''); setDialogOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setError(''); setDialogOpen(true); };

  const handleSubmit = (id: string, data: PartyPayload) => {
    setError('');
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate({ id, ...data });
  };

  const handleImport = async (rows: Record<string, string>[]) => {
    setError('');
    let ok = 0;
    const failed: string[] = [];
    for (const r of rows) {
      const id = (r.id ?? '').trim();
      const name = (r.name ?? '').trim();
      if (!id || !name) { failed.push(id || name || 'row'); continue; }
      try {
        await createCustomer({
          id, name,
          short_name: r.short_name || null,
          phone: null,
          incoterms: r.incoterms || null,
          currency: r.currency || null,
          address: r.address || null,
          city: r.city || null,
          zip_code: null,
          country: r.country || null,
        });
        ok++;
      } catch {
        failed.push(id);
      }
    }
    invalidate();
    if (failed.length) {
      const shown = failed.slice(0, 5).join(', ');
      setError(`Imported ${ok}. Failed ${failed.length}: ${shown}${failed.length > 5 ? '…' : ''}`);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget);
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
    handleSubmit, handleImport,
    saving: createMutation.isPending || updateMutation.isPending,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
