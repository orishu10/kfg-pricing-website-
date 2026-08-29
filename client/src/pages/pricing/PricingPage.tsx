import { useAuth } from '../../context/AuthContext';
import { usePricingPage } from './hooks/usePricingPage';
import { PricingFormDialog } from './components/PricingFormDialog';
import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../components';
import { fmtDate } from './utils/helpers';
import type { Pricing } from '../../api';

const columns: Column<Pricing>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'kfg_sku', label: 'KFG SKU #', mono: true, render: (r) => r.kfg_sku ?? '' },
  { key: 'customer_name', label: 'Customer', sortable: true, render: (r) => r.customer_name ?? '' },
  { key: 'supplier_name', label: 'Supplier', sortable: true, render: (r) => r.supplier_name ?? '' },
  { key: 'description', label: 'Description', sortable: true, render: (r) => r.description ?? '' },
  { key: 'size', label: 'Size', render: (r) => r.size ?? '' },
  {
    key: 'updated_at',
    label: 'Last Updated',
    sortable: true,
    value: (r) => r.updated_at ?? r.created_at,
    render: (r) => fmtDate(r.updated_at ?? r.created_at),
  },
];

export const PricingPage = () => {
  const { username } = useAuth();
  const {
    pricings, items, customers, search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog,
    error, handleSubmit,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  } = usePricingPage();

  return (
    <>
      {!dialogOpen && <ErrorAlert message={error} />}

      <DataTable
        title="Pricing"
        exportFileName="pricing"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by SKU, customer, supplier or description…"
        onAdd={openAdd}
        columns={columns}
        rows={pricings}
        getRowId={(p) => p.id}
        onRowClick={openEdit}
        onEdit={openEdit}
        onDelete={handleDelete}
        emptyMessage="No pricing records."
      />

      <PricingFormDialog
        open={dialogOpen}
        initial={editing}
        items={items}
        customers={customers}
        username={username}
        error={error}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete pricing?"
        message={`Delete pricing "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default PricingPage;
