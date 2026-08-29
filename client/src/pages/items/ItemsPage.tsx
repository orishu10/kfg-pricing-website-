import { ItemFormDialog } from './components/itemFormDialog/ItemFormDialog';
import { useItemsPage } from './hooks/useItemsPage';
import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../components';
import type { Item } from '../../api';

const columns: Column<Item>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'supplier_name', label: 'Supplier', sortable: true, render: (r) => r.supplier_name ?? r.supplier_id },
  { key: 'name', label: 'Description', sortable: true },
  { key: 'size', label: 'Size', render: (r) => r.size ?? '' },
  { key: 'unit_weight', label: 'Unit Weight', align: 'right', render: (r) => r.unit_weight ?? '' },
  { key: 'units_in_case', label: 'Units / Case', align: 'right', render: (r) => r.units_in_case ?? '' },
  { key: 'cases_in_fcl', label: 'Cases / FCL', align: 'right', render: (r) => r.cases_in_fcl ?? '' },
];

export const ItemsPage = () => {
  const {
    items, suppliers, search, setSearch,
    dialogOpen, editing, openAdd, openEdit, closeDialog, error, handleSubmit, handleImport,
    deleteTarget, setDeleteTarget, confirmDelete,
  } = useItemsPage();

  return (
    <>
      {!dialogOpen && <ErrorAlert message={error} />}

      <DataTable
        title="Items"
        exportFileName="items"
        onImport={handleImport}
        onAdd={openAdd}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by description, supplier or ID…"
        columns={columns}
        rows={items}
        getRowId={(i) => i.id}
        onRowClick={openEdit}
        onEdit={openEdit}
        onDelete={(i) => setDeleteTarget({ id: i.id, name: i.name })}
        emptyMessage="No items."
      />

      <ItemFormDialog
        open={dialogOpen}
        initial={editing}
        suppliers={suppliers}
        error={error}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete item?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default ItemsPage;
