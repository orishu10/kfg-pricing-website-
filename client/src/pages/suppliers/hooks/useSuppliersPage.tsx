import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  type Supplier, type PartyPayload,
} from '../../../api';

export const useSuppliersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: suppliers = [], isError } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['suppliers'] });

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
    mutationFn: (data: { id: string } & PartyPayload) => createSupplier(data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: onError('Failed to create supplier'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartyPayload }) => updateSupplier(id, data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: onError('Failed to update supplier'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: invalidate,
    onError: () => setError('Failed to delete supplier'),
  });

  const openAdd = () => { setEditing(null); setError(''); setDialogOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setError(''); setDialogOpen(true); };

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
  const filtered = suppliers.filter(
    (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
  );

  return {
    suppliers: filtered,
    search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error: error || (isError ? 'Failed to load suppliers' : ''),
    handleSubmit,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
