import { useSuppliersPage } from './hooks/useSuppliersPage';
import {
  ConfirmDialog, DataTable, ErrorAlert, PartyFormDialog, type Column,
} from '../../components';
import type { Supplier } from '../../api';

const columns: Column<Supplier>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'name', label: 'Supplier', sortable: true, filterable: false },
  { key: 'short_name', label: 'Short Name', sortable: true, filterable: false, render: (r) => r.short_name ?? '' },
  { key: 'address', label: 'Address', render: (r) => r.address ?? '' },
  { key: 'city', label: 'City', render: (r) => r.city ?? '' },
  { key: 'country', label: 'Country', filterable: true, render: (r) => r.country ?? '' },
  { key: 'incoterms', label: 'Incoterms', sortable: true, render: (r) => r.incoterms ?? '' },
];

export const SuppliersPage = () => {
  const {
    suppliers, search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error, handleSubmit, handleImport,
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
      {!dialogOpen && <ErrorAlert message={error} />}

      <DataTable
        title="Suppliers"
        exportFileName="suppliers"
        onImport={handleImport}
        onAdd={openAdd}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or ID…"
        columns={columns}
        rows={suppliers}
        getRowId={(s) => s.id}
        onRowClick={openEdit}
        onEdit={openEdit}
        onDelete={(s) => setDeleteTarget({ id: s.id, name: s.name })}
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
