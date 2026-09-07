import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../../components';
import { getRoutes, deleteRoute, type Route } from '../../../../api';

export const useRoutesPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: routes = [], isError } = useQuery({ queryKey: ['routes'], queryFn: getRoutes });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; name: string }) => deleteRoute(id),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      showToast({ title: `Route ${name} deleted`, variant: 'info' });
    },
    onError: () => setError('Failed to delete route'),
  });

  const handleDelete = (r: Route) =>
    setDeleteTarget({ id: r.id, name: r.reference || r.shipping_line || r.id });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget);
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
    allRoutes: routes,
    search, setSearch,
    error: error || (isError ? 'Failed to load routes' : ''),
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
