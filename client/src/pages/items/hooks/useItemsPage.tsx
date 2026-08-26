import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getItems, getSuppliers, createItem, deleteItem, type NewItem } from '../../../api';

export const useItemsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: items = [], isError } = useQuery({ queryKey: ['items'], queryFn: () => getItems() });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['items'] });
  const closeDialog = () => { setDialogOpen(false); setError(''); };

  const createMutation = useMutation({
    mutationFn: (data: NewItem) => createItem(data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: invalidate,
    onError: () => setError('Failed to delete item'),
  });

  const openAdd = () => { setError(''); setDialogOpen(true); };

  const handleSubmit = (data: NewItem) => {
    setError('');
    createMutation.mutate(data);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const q = search.toLowerCase();
  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q) ||
      (i.supplier_name ?? '').toLowerCase().includes(q),
  );

  return {
    items: filtered,
    suppliers,
    search, setSearch,
    dialogOpen, openAdd, closeDialog,
    error: error || (isError ? 'Failed to load items' : ''),
    handleSubmit,
    deleteTarget, setDeleteTarget, confirmDelete,
  };
};
