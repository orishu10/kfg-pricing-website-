import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { useWeeklyShipmentsPage } from './hooks/useWeeklyShipmentsPage';
import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../../components';
import { WeekSelector } from '../components/WeekSelector';
import { fmtDate } from '../../pricing/utils/helpers';
import type { WeeklyShipment } from '../../../api';

const buildColumns = (onToggleBooked: (s: WeeklyShipment) => void): Column<WeeklyShipment>[] => [
  { key: 'id', label: 'LOG #', mono: true, align: 'center' },
  { key: 'con', label: 'CON', render: (r) => r.con ?? '' },
  { key: 'customer', label: 'Customer', sortable: true, render: (r) => r.customer ?? '' },
  { key: 'supplier', label: 'Supplier', sortable: true, render: (r) => r.supplier ?? '' },
  { key: 'description', label: 'Description', render: (r) => r.description ?? '' },
  { key: 'pup', label: 'PUP', render: (r) => r.pup ?? '' },
  { key: 'pol', label: 'POL', render: (r) => r.pol ?? '' },
  { key: 'pod', label: 'POD', render: (r) => r.pod ?? '' },
  {
    key: 'vessel',
    label: 'Schedule',
    render: (r) => (
      <Box>
        <Typography sx={{ fontSize: '0.85rem' }}>{r.vessel ?? ''}</Typography>
        {r.voyage && (
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>V: {r.voyage}</Typography>
        )}
      </Box>
    ),
  },
  { key: 'etd', label: 'ETD', sortable: true, value: (r) => r.etd, render: (r) => fmtDate(r.etd) },
  { key: 'eta', label: 'ETA', sortable: true, value: (r) => r.eta, render: (r) => fmtDate(r.eta) },
  {
    key: 'booked',
    label: 'Booking',
    align: 'center',
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
  const navigate = useNavigate();
  const {
    rows, monday, setMonday, search, setSearch, error,
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
        onAdd={() => navigate('/logistics/weekly-shipments/new')}
        headerCenter={<WeekSelector monday={monday} onChange={setMonday} />}
        disableFilters
        fitWidth
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        onRowClick={(r) => navigate(`/logistics/weekly-shipments/${r.id}`)}
        onEdit={(r) => navigate(`/logistics/weekly-shipments/${r.id}`)}
        onDuplicate={(r) => navigate(`/logistics/weekly-shipments/new?from=${r.id}`)}
        onDelete={handleDelete}
        emptyMessage="No shipments this week."
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
