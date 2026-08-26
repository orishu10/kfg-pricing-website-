import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getItems, getSuppliers, createItem, type NewItem } from '../../../api';

export const useItemsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: items = [], isError } = useQuery({ queryKey: ['items'], queryFn: () => getItems() });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });

  const closeDialog = () => { setDialogOpen(false); setError(''); };

  const createMutation = useMutation({
    mutationFn: (data: NewItem) => createItem(data),
    onSuccess: () => {
      closeDialog();
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create item');
    },
  });

  const openAdd = () => { setError(''); setDialogOpen(true); };

  const handleSubmit = (data: NewItem) => {
    setError('');
    createMutation.mutate(data);
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
  };
};
