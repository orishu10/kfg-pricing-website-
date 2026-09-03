import { useWeeklyShipmentsPage } from './hooks/useWeeklyShipmentsPage';
import { ConfirmDialog, DataTable, ErrorAlert } from '../../../components';
import { WeekSelector } from '../components/WeekSelector';
import { buildShipmentColumns } from '../components/shipmentColumns';
import { ShipmentFormDialog } from './components/ShipmentFormDialog';
import { FormatPickerDialog } from './components/FormatPickerDialog';

export const WeeklyShipmentsPage = () => {
  const {
    rows, monday, setMonday, search, setSearch, error,
    formats, formError, formatPickerOpen, setFormatPickerOpen, dialogOpen,
    selectedFormat, sourceShipment, isEdit,
    openFormatPicker, pickFormat, openEdit, openDuplicate, closeDialog, submitShipment,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete, toggleBooked,
  } = useWeeklyShipmentsPage();

  const columns = buildShipmentColumns(toggleBooked);

  return (
    <>
      <ErrorAlert message={error} />

      <DataTable
        title="Weekly Shipments IL"
        exportFileName="weekly-shipments-il"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by customer, supplier, vessel or port…"
        onAdd={openFormatPicker}
        headerCenter={<WeekSelector monday={monday} onChange={setMonday} />}
        disableFilters
        fitWidth
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        onRowClick={openEdit}
        onEdit={openEdit}
        onDuplicate={openDuplicate}
        onDelete={handleDelete}
        emptyMessage="No shipments this week."
      />

      <FormatPickerDialog
        open={formatPickerOpen}
        formats={formats}
        onPick={pickFormat}
        onClose={() => setFormatPickerOpen(false)}
      />

      <ShipmentFormDialog
        open={dialogOpen}
        source={sourceShipment}
        isEdit={isEdit}
        format={selectedFormat}
        error={formError}
        onClose={closeDialog}
        onSubmit={submitShipment}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete shipment?"
        message={`Delete shipment "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default WeeklyShipmentsPage;
