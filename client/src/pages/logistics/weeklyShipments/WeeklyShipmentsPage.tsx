import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { useWeeklyShipmentsPage } from './hooks/useWeeklyShipmentsPage';
import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../../components';
import { WeekSelector } from '../components/WeekSelector';
import { fmtDate } from '../../pricing/utils/helpers';
import { ShipmentFormDialog } from './components/ShipmentFormDialog';
import { FormatPickerDialog } from './components/FormatPickerDialog';
import type { WeeklyShipment } from '../../../api';

const supplierLabel = (shipment: WeeklyShipment) =>
  shipment.suppliers?.length ? shipment.suppliers.join(', ') : shipment.supplier ?? '';

const buildColumns = (onToggleBooked: (shipment: WeeklyShipment) => void): Column<WeeklyShipment>[] => [
  { key: 'id', label: 'LOG #', mono: true, align: 'center', width: 58 },
  { key: 'con', label: 'CON', width: 92, render: (r) => r.con ?? '' },
  { key: 'customer', label: 'Customer', sortable: true, render: (r) => r.customer ?? '' },
  {
    key: 'supplier',
    label: 'Supplier',
    sortable: true,
    width: 100,
    value: supplierLabel,
    render: supplierLabel,
  },
  { key: 'description', label: 'Description', render: (r) => r.description ?? '' },
  { key: 'pup', label: 'PUP', width: 68, render: (r) => r.pup ?? '' },
  { key: 'pol', label: 'POL', width: 68, render: (r) => r.pol ?? '' },
  { key: 'pod', label: 'POD', width: 84, render: (r) => r.pod ?? '' },
  {
    key: 'vessel',
    label: 'Schedule',
    width: 118,
    render: (r) => (
      <Box>
        <Typography sx={{ fontSize: '0.85rem' }}>{r.vessel ?? ''}</Typography>
        {r.voyage && (
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>V: {r.voyage}</Typography>
        )}
      </Box>
    ),
  },
  { key: 'etd', label: 'ETD', sortable: true, width: 82, value: (r) => r.etd, render: (r) => fmtDate(r.etd) },
  { key: 'eta', label: 'ETA', sortable: true, width: 82, value: (r) => r.eta, render: (r) => fmtDate(r.eta) },
  {
    key: 'booked',
    label: 'Booking',
    align: 'center',
    width: 76,
    render: (r) => (
      <Checkbox
        size="small"
        checked={r.booked}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggleBooked(r)}
        sx={{ p: 0 }}
      />
    ),
  },
];

export const WeeklyShipmentsPage = () => {
  const {
    rows, monday, setMonday, search, setSearch, error,
    formats, formError, formatPickerOpen, setFormatPickerOpen, dialogOpen,
    selectedFormat, sourceShipment, isEdit,
    openFormatPicker, pickFormat, openEdit, openDuplicate, closeDialog, submitShipment,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete, toggleBooked,
  } = useWeeklyShipmentsPage();

  const columns = buildColumns(toggleBooked);

  return (
    <>
      <ErrorAlert message={error} />

      <DataTable
        title="Weekly Shipments"
        exportFileName="weekly-shipments"
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
