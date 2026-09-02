import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUsers, createUser, updateUser, deleteUser,
  type AppUser, type UserPayload,
} from '../../../api';

export const useUsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const { data: users = [], isError } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const onRequestError = (fallback: string) => (err: unknown) => {
    const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(message || fallback);
  };

  const handleSaved = () => {
    setError('');
    setDialogOpen(false);
    setEditing(null);
    invalidate();
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: handleSaved,
    onError: onRequestError('Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserPayload }) => updateUser(id, data),
    onSuccess: handleSaved,
    onError: onRequestError('Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { setError(''); setDeleteTarget(null); invalidate(); },
    onError: (err) => { setDeleteTarget(null); onRequestError('Failed to delete user')(err); },
  });

  const openAdd = () => {
    setError('');
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setError('');
    setEditing(user);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setError('');
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSubmit = (data: UserPayload) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  const term = search.trim().toLowerCase();
  const visibleUsers = term
    ? users.filter((user) =>
        user.username.toLowerCase().includes(term) ||
        (user.email ?? '').toLowerCase().includes(term))
    : users;

  return {
    users: visibleUsers,
    search,
    setSearch,
    error: error || (isError ? 'Failed to load users' : ''),
    dialogOpen,
    editing,
    openAdd,
    openEdit,
    closeDialog,
    handleSubmit,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
  };
};
