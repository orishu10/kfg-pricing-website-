import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPricings, deletePricing, type Pricing } from '../../../api';

export const usePricingPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: pricings = [], isError } = useQuery({ queryKey: ['pricing'], queryFn: getPricings });

  const deleteMutation = useMutation({
    mutationFn: deletePricing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pricing'] }),
    onError: () => setError('Failed to delete pricing'),
  });

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
    search, setSearch,
    error: error || (isError ? 'Failed to load pricing' : ''),
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
