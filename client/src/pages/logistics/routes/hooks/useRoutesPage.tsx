import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRoutes, deleteRoute, type Route } from '../../../../api';

export const useRoutesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: routes = [], isError } = useQuery({ queryKey: ['routes'], queryFn: getRoutes });

  const deleteMutation = useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
    onError: () => setError('Failed to delete route'),
  });

  const handleDelete = (r: Route) =>
    setDeleteTarget({ id: r.id, name: r.reference || r.shipping_line || r.id });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const q = search.toLowerCase();
  const filtered = routes.filter(
    (r) =>
      (r.reference ?? '').toLowerCase().includes(q) ||
      (r.agent ?? '').toLowerCase().includes(q) ||
      (r.shipping_line ?? '').toLowerCase().includes(q) ||
      (r.origin ?? '').toLowerCase().includes(q) ||
      (r.destination ?? '').toLowerCase().includes(q) ||
      (r.origin_port ?? '').toLowerCase().includes(q) ||
      (r.destination_port ?? '').toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q),
  );

  return {
    routes: filtered,
    search, setSearch,
    error: error || (isError ? 'Failed to load routes' : ''),
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
