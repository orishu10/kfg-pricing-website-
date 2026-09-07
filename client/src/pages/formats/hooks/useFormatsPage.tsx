import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/auth';
import { useToast } from '../../../components';
import {
  getShipmentFormats, createShipmentFormat, updateShipmentFormat, deleteShipmentFormat,
  type ShipmentFormat, type ShipmentFormatPayload,
} from '../../../api';

export const useFormatsPage = () => {
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShipmentFormat | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShipmentFormat | null>(null);

  const { data: formats = [], isError } = useQuery({
    queryKey: ['shipment-formats'],
    queryFn: getShipmentFormats,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['shipment-formats'] });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setFormError('');
  };

  const handleSaved = (format: ShipmentFormat) => {
    invalidate();
    closeDialog();
    showToast({ title: `Format ${format.name} saved` });
  };

  const onFormError = (fallback: string) => (err: unknown) => {
    const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setFormError(message || fallback);
  };

  const createMutation = useMutation({
    mutationFn: createShipmentFormat,
    onSuccess: handleSaved,
    onError: onFormError('Failed to create format'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ShipmentFormatPayload }) => updateShipmentFormat(id, data),
    onSuccess: handleSaved,
    onError: onFormError('Failed to update format'),
  });

  const deleteMutation = useMutation({
    mutationFn: (format: ShipmentFormat) => deleteShipmentFormat(format.id),
    onSuccess: (_, format) => {
      invalidate();
      showToast({ title: `Format ${format.name} deleted`, variant: 'info' });
    },
    onError: () => setError('Failed to delete format'),
  });

  const openCreate = () => {
    setEditing(null);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (format: ShipmentFormat) => {
    setEditing(format);
    setFormError('');
    setDialogOpen(true);
  };

  const submitFormat = (payload: ShipmentFormatPayload) => {
    setFormError('');
    const data = { ...payload, updated_by: username ?? '' };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget);
    setDeleteTarget(null);
  };

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return formats;
    return formats.filter((format) => format.name.toLowerCase().includes(query));
  }, [formats, search]);

  return {
    rows, search, setSearch,
    error: error || (isError ? 'Failed to load formats' : ''),
    formError, dialogOpen, editing, openCreate, openEdit, closeDialog, submitFormat,
    saving: createMutation.isPending || updateMutation.isPending,
    deleteTarget, setDeleteTarget, confirmDelete,
  };
};
