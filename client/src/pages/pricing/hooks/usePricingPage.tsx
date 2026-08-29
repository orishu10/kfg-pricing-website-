import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPricings, getItems, getCustomers,
  createPricing, updatePricing, deletePricing,
  type Pricing, type PricingInput,
} from '../../../api';

export const usePricingPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pricing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: pricings = [], isError } = useQuery({ queryKey: ['pricing'], queryFn: getPricings });
  const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: () => getItems() });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['pricing'] });

  const onError = (fallback: string) => (err: unknown) => {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(msg || fallback);
  };

  const closeDialog = () => { setDialogOpen(false); setEditing(null); setError(''); };

  const createMutation = useMutation({
    mutationFn: (data: PricingInput) => createPricing(data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: onError('Failed to create pricing'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PricingInput }) => updatePricing(id, data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: onError('Failed to update pricing'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePricing,
    onSuccess: invalidate,
    onError: () => setError('Failed to delete pricing'),
  });

  const openAdd = () => { setEditing(null); setError(''); setDialogOpen(true); };
  const openEdit = (p: Pricing) => { setEditing(p); setError(''); setDialogOpen(true); };

  const handleSubmit = (data: PricingInput) => {
    setError('');
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const handleDelete = (p: Pricing) =>
    setDeleteTarget({ id: p.id, name: p.kfg_sku || p.description || p.id });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const q = search.toLowerCase();
  const filtered = pricings.filter(
    (p) =>
      (p.kfg_sku ?? '').toLowerCase().includes(q) ||
      (p.customer_name ?? '').toLowerCase().includes(q) ||
      (p.supplier_name ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q),
  );

  return {
    pricings: filtered,
    items, customers,
    search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error: error || (isError ? 'Failed to load pricing' : ''),
    handleSubmit,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
