import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getItems, getSuppliers, createItem, updateItem, deleteItem, type Item, type NewItem } from '../../../api';

export const useItemsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [dupSource, setDupSource] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: items = [], isError } = useQuery({ queryKey: ['items'], queryFn: () => getItems() });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['items'] });
  const closeDialog = () => { setDialogOpen(false); setEditing(null); setDupSource(null); setError(''); };

  const onError = (fallback: string) => (err: unknown) => {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(msg || fallback);
  };

  const createMutation = useMutation({
    mutationFn: (data: NewItem) => createItem(data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: onError('Failed to create item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NewItem }) => updateItem(id, data),
    onSuccess: () => { closeDialog(); invalidate(); },
    onError: onError('Failed to update item'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: invalidate,
    onError: () => setError('Failed to delete item'),
  });

  const openAdd = () => { setEditing(null); setDupSource(null); setError(''); setDialogOpen(true); };
  const openEdit = (item: Item) => { setEditing(item); setDupSource(null); setError(''); setDialogOpen(true); };
  const openDuplicate = (item: Item) => { setEditing(null); setDupSource(item); setError(''); setDialogOpen(true); };

  const handleSubmit = (data: NewItem) => {
    setError('');
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const num = (v?: string) => {
    const t = (v ?? '').trim();
    return t === '' || Number.isNaN(Number(t)) ? null : Number(t);
  };

  const handleImport = async (rows: Record<string, string>[]) => {
    setError('');
    const byName = new Map(suppliers.map((s) => [s.name.trim().toLowerCase(), s.id]));
    let ok = 0;
    const failed: string[] = [];
    for (const r of rows) {
      const name = (r.name ?? '').trim();
      const supName = (r.supplier_name ?? '').trim();
      const supplier_id = byName.get(supName.toLowerCase());
      if (!name || !supplier_id) { failed.push(name || supName || 'row'); continue; }
      try {
        await createItem({
          supplier_id,
          name,
          size: r.size || null,
          unit_weight: num(r.unit_weight),
          units_in_case: num(r.units_in_case),
          cases_in_fcl: num(r.cases_in_fcl),
        });
        ok++;
      } catch {
        failed.push(name);
      }
    }
    invalidate();
    if (failed.length) {
      const shown = failed.slice(0, 5).join(', ');
      setError(`Imported ${ok}. Failed ${failed.length} (check supplier names): ${shown}${failed.length > 5 ? '…' : ''}`);
    }
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
    dialogOpen, openAdd, openEdit, openDuplicate, closeDialog,
    dialogInitial: editing ?? dupSource,
    isEditing: !!editing,
    error: error || (isError ? 'Failed to load items' : ''),
    handleSubmit, handleImport,
    deleteTarget, setDeleteTarget, confirmDelete,
  };
};
