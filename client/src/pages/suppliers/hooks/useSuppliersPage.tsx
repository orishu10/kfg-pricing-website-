import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../components';
import {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  type Supplier, type PartyPayload,
} from '../../../api';

export const useSuppliersPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
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
    onSuccess: (saved) => {
      closeDialog();
      invalidate();
      showToast({ title: `Supplier ${saved.name} created` });
    },
    onError: onError('Failed to create supplier'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartyPayload }) => updateSupplier(id, data),
    onSuccess: (saved) => {
      closeDialog();
      invalidate();
      showToast({ title: `Supplier ${saved.name} saved` });
    },
    onError: onError('Failed to update supplier'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; name: string }) => deleteSupplier(id),
    onSuccess: (_, { name }) => {
      invalidate();
      showToast({ title: `Supplier ${name} deleted`, variant: 'info' });
    },
    onError: () => setError('Failed to delete supplier'),
  });

  const openAdd = () => { setEditing(null); setError(''); setDialogOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setError(''); setDialogOpen(true); };

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
        await createSupplier({
          id, name,
          short_name: r.short_name || null,
          phone: null,
          incoterms: r.incoterms || null,
          currency: r.currency || null,
          payment_terms: r.payment_terms || null,
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
  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(q)
      || (s.short_name ?? '').toLowerCase().includes(q)
      || s.id.toLowerCase().includes(q),
  );

  return {
    suppliers: filtered,
    search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error: error || (isError ? 'Failed to load suppliers' : ''),
    handleSubmit, handleImport,
    saving: createMutation.isPending || updateMutation.isPending,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
