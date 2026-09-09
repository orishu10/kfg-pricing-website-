import { useCustomersPage } from './hooks/useCustomersPage';
import {
  ConfirmDialog, DataTable, ErrorAlert, PartyFormDialog, type Column,
} from '../../components';
import { partyLabel } from '../../utils/format';
import type { Customer } from '../../api';

const columns: Column<Customer>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'short_name', label: 'Customer', sortable: true, filterable: false, render: (r) => partyLabel(r.short_name, r.name) },
  { key: 'name', label: 'Full Name', hidden: true },
  { key: 'address', label: 'Address', render: (r) => r.address ?? '' },
  { key: 'city', label: 'City', render: (r) => r.city ?? '' },
  { key: 'country', label: 'Country', filterable: true, render: (r) => r.country ?? '' },
  { key: 'currency', label: 'Currency', align: 'center', render: (r) => r.currency ?? '' },
  { key: 'payment_terms', label: 'Payment Terms', filterable: true, render: (r) => r.payment_terms ?? '' },
  { key: 'incoterms', label: 'Incoterms', sortable: true, render: (r) => r.incoterms ?? '' },
];

export const CustomersPage = () => {
  const {
    customers, search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error, handleSubmit, handleImport, saving,
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
        saving={saving}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onDelete={requestDelete}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete customer?"
        target={deleteTarget?.name}
        message="Its pricing records are removed too. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default CustomersPage;
