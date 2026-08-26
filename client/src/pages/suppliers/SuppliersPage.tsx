import Box from '@mui/material/Box';
import { useSuppliersPage } from './hooks/useSuppliersPage';
import {
  ConfirmDialog, DataTable, ErrorAlert, PageHeader, PartyFormDialog, SearchBar,
  type Column,
} from '../../components';
import type { Supplier } from '../../api';

const columns: Column<Supplier>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'name', label: 'Supplier', sortable: true },
  { key: 'short_name', label: 'Short Name', sortable: true, render: (r) => r.short_name ?? '' },
  { key: 'address', label: 'Address', render: (r) => r.address ?? '' },
  { key: 'city', label: 'City', sortable: true, render: (r) => r.city ?? '' },
  { key: 'country', label: 'Country', sortable: true, render: (r) => r.country ?? '' },
  { key: 'incoterms', label: 'Incoterms', sortable: true, render: (r) => r.incoterms ?? '' },
];

export const SuppliersPage = () => {
  const {
    suppliers, search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error, handleSubmit,
    deleteTarget, setDeleteTarget, confirmDelete,
  } = useSuppliersPage();

  const requestDelete = () => {
    if (!editing) return;
    const target = { id: editing.id, name: editing.name };
    closeDialog();
    setDeleteTarget(target);
  };

  return (
    <>
      <PageHeader title="Suppliers" actionLabel="+ Add Supplier" onAction={openAdd} />

      {!dialogOpen && <ErrorAlert message={error} />}

      <Box sx={{ mb: 2 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID…" />
      </Box>

      <DataTable
        columns={columns}
        rows={suppliers}
        getRowId={(s) => s.id}
        onRowClick={openEdit}
        emptyMessage="No suppliers."
      />

      <PartyFormDialog
        open={dialogOpen}
        entity="Supplier"
        initial={editing}
        error={error}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete supplier?"
        message={`Delete "${deleteTarget?.name}"? This also removes its items. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default SuppliersPage;
