import Box from '@mui/material/Box';
import { useCustomersPage } from './hooks/useCustomersPage';
import {
  ConfirmDialog, DataTable, ErrorAlert, PageHeader, PartyFormDialog, SearchBar,
  type Column,
} from '../../components';
import type { Customer } from '../../api';

const columns: Column<Customer>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'name', label: 'Customer', sortable: true },
  { key: 'short_name', label: 'Short Name', sortable: true, render: (r) => r.short_name ?? '' },
  { key: 'address', label: 'Address', render: (r) => r.address ?? '' },
  { key: 'city', label: 'City', sortable: true, render: (r) => r.city ?? '' },
  { key: 'country', label: 'Country', sortable: true, render: (r) => r.country ?? '' },
  { key: 'incoterms', label: 'Incoterms', sortable: true, render: (r) => r.incoterms ?? '' },
];

export const CustomersPage = () => {
  const {
    customers, search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error, handleSubmit,
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
      <PageHeader title="Customers" actionLabel="+ Add Customer" onAction={openAdd} />

      {!dialogOpen && <ErrorAlert message={error} />}

      <Box sx={{ mb: 2 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID…" />
      </Box>

      <DataTable
        columns={columns}
        rows={customers}
        getRowId={(c) => c.id}
        onRowClick={openEdit}
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
