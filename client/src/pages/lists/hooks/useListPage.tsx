import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLookupsByCategory, createLookup, updateLookup, deleteLookup, reorderLookups,
  type LookupCategory, type LookupOption,
} from '../../../api';

export const useListPage = (category: LookupCategory) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LookupOption | null>(null);

  const { data: options = [], isError } = useQuery({
    queryKey: ['lookups', category],
    queryFn: () => getLookupsByCategory(category),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['lookups', category] });
    queryClient.invalidateQueries({ queryKey: ['lookups'] });
  };

  const onError = (fallback: string) => (err: unknown) => {
    const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(message || fallback);
  };

  const createMutation = useMutation({
    mutationFn: ({ value, pallets }: { value: string; pallets?: number | null }) =>
      createLookup(category, value, pallets),
    onSuccess: () => { setError(''); invalidate(); },
    onError: onError('Failed to add option'),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) => updateLookup(id, { value }),
    onSuccess: () => { setError(''); invalidate(); },
    onError: onError('Failed to rename option'),
  });

  const palletsMutation = useMutation({
    mutationFn: ({ id, pallets }: { id: number; pallets: number | null }) => updateLookup(id, { pallets }),
    onSuccess: () => { setError(''); invalidate(); },
    onError: onError('Failed to update pallets'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLookup(id),
    onSuccess: () => { setError(''); invalidate(); },
    onError: onError('Failed to delete option'),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => reorderLookups(category, ids),
    onError: onError('Failed to reorder options'),
    onSettled: invalidate,
  });

  const add = (value: string, pallets?: number | null) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    createMutation.mutate({ value: trimmed, pallets });
  };

  const rename = (id: number, value: string) => renameMutation.mutate({ id, value });

  const setPallets = (id: number, pallets: number | null) => palletsMutation.mutate({ id, pallets });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const reorder = (ids: number[]) => reorderMutation.mutate(ids);

  return {
    options,
    error: error || (isError ? 'Failed to load options' : ''),
    deleteTarget,
    setDeleteTarget,
    add,
    rename,
    setPallets,
    confirmDelete,
    reorder,
  };
};
