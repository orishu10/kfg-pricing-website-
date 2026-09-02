import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../components';
import { fmtDate } from '../pricing/utils/helpers';
import { useFormatsPage } from './hooks/useFormatsPage';
import { FormatFormDialog } from './components/FormatFormDialog';
import { sectionSummary } from './utils/helpers';
import type { ShipmentFormat } from '../../api';

const columns: Column<ShipmentFormat>[] = [
  { key: 'name', label: 'Format', sortable: true, width: 200 },
  {
    key: 'fields',
    label: 'Sections',
    value: (r) => sectionSummary(r.fields),
    render: (r) => sectionSummary(r.fields),
  },
  {
    key: 'count',
    label: 'Fields',
    align: 'center',
    width: 76,
    value: (r) => r.fields.length,
    render: (r) => r.fields.length,
  },
  { key: 'updated_by', label: 'Updated By', width: 120, render: (r) => r.updated_by ?? '' },
  {
    key: 'updated_at',
    label: 'Updated',
    sortable: true,
    width: 100,
    value: (r) => r.updated_at,
    render: (r) => fmtDate(r.updated_at),
  },
];

export const FormatsPage = () => {
  const {
    rows, search, setSearch, error, formError, dialogOpen, editing,
    openCreate, openEdit, closeDialog, submitFormat,
    deleteTarget, setDeleteTarget, confirmDelete,
  } = useFormatsPage();

  return (
    <>
      <ErrorAlert message={error} />

      <DataTable
        title="Shipment Formats"
        exportFileName="shipment-formats"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search formats…"
        onAdd={openCreate}
        disableFilters
        fitWidth
        columns={columns}
        rows={rows}
        getRowId={(r) => String(r.id)}
        onRowClick={openEdit}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No formats yet."
      />

      <FormatFormDialog
        open={dialogOpen}
        initial={editing}
        error={formError}
        onClose={closeDialog}
        onSubmit={submitFormat}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete format?"
        message={`Delete format "${deleteTarget?.name}"? Shipments already created keep their fields.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default FormatsPage;
