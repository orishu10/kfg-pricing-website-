import { useUsersPage } from './hooks/useUsersPage';
import { UserFormDialog } from './components/UserFormDialog';
import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../components';
import { permissionsLabel, roleLabel } from './utils/helpers';
import { useAuth } from '../../context/auth';
import type { AppUser } from '../../api';

const columns: Column<AppUser>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'username', label: 'Username', sortable: true, filterable: false },
  { key: 'email', label: 'Email', sortable: true, render: (r) => r.email ?? '' },
  { key: 'role', label: 'Role', sortable: true, filterable: true, align: 'center', render: roleLabel, value: roleLabel },
  { key: 'permissions', label: 'Permissions', render: permissionsLabel, value: permissionsLabel },
];

export const UsersPage = () => {
  const { username } = useAuth();
  const {
    users, search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error, handleSubmit,
    deleteTarget, setDeleteTarget, confirmDelete,
  } = useUsersPage();

  const requestDelete = () => {
    if (!editing) return;
    const target = editing;
    closeDialog();
    setDeleteTarget(target);
  };

  return (
    <>
      {!dialogOpen && <ErrorAlert message={error} />}

      <DataTable
        title="Users"
        exportFileName="users"
        onAdd={openAdd}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by username or email…"
        columns={columns}
        rows={users}
        getRowId={(user) => String(user.id)}
        onRowClick={openEdit}
        onEdit={openEdit}
        onDelete={(user) => setDeleteTarget(user)}
        emptyMessage="No users."
      />

      <UserFormDialog
        open={dialogOpen}
        initial={editing}
        error={error}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onDelete={editing?.username === username ? undefined : requestDelete}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user?"
        message={`Delete "${deleteTarget?.username}"? They will lose access immediately. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default UsersPage;
