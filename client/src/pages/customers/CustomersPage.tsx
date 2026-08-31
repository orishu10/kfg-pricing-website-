import { useCustomersPage } from './hooks/useCustomersPage';
import {
  ConfirmDialog, DataTable, ErrorAlert, PartyFormDialog, type Column,
} from '../../components';
import type { Customer } from '../../api';

const columns: Column<Customer>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'name', label: 'Customer', sortable: true, filterable: false },
  { key: 'short_name', label: 'Short Name', sortable: true, filterable: false, render: (r) => r.short_name ?? '' },
  { key: 'address', label: 'Address', render: (r) => r.address ?? '' },
  { key: 'city', label: 'City', render: (r) => r.city ?? '' },
  { key: 'country', label: 'Country', filterable: true, render: (r) => r.country ?? '' },
  { key: 'currency', label: 'Currency', align: 'center', render: (r) => r.currency ?? '' },
  { key: 'incoterms', label: 'Incoterms', sortable: true, render: (r) => r.incoterms ?? '' },
];

export const CustomersPage = () => {
  const {
    customers, search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error, handleSubmit, handleImport,
    deleteTarget, setDeleteTarget, confirmDelete,
  } = useCustomersPage();

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
        title="Customers"
        exportFileName="customers"
        onImport={handleImport}
        onAdd={openAdd}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or ID…"
        columns={columns}
        rows={customers}
        getRowId={(c) => c.id}
        onRowClick={openEdit}
        onEdit={openEdit}
        onDelete={(c) => setDeleteTarget({ id: c.id, name: c.name })}
        emptyMessage="No customers."
      />

      <PartyFormDialog
        open={dialogOpen}
        entity="Customer"
        initial={editing}
        error={error}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete customer?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default CustomersPage;
