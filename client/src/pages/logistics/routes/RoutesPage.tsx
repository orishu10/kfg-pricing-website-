import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useRoutesPage } from './hooks/useRoutesPage';
import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../../components';
import { fmtDate } from '../../pricing/utils/helpers';
import { daysUntil, isUrgent, EXPIRY_WINDOW } from './utils/helpers';
import type { Route } from '../../../api';

const money = (v: string | null) => (v == null || v === '' ? '' : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 }));

const validityCell = (r: Route) => {
  const days = daysUntil(r.validity);
  const showChip = days != null && days >= 0 && days <= EXPIRY_WINDOW;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {fmtDate(r.validity)}
      {showChip && (
        <Chip
          size="small"
          label={days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
          color={isUrgent(days) ? 'error' : 'warning'}
          sx={{ height: 20, fontSize: '0.68rem' }}
        />
      )}
    </Box>
  );
};

const columns: Column<Route>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'reference', label: 'Reference', mono: true, render: (r) => r.reference ?? '' },
  { key: 'agent', label: 'Agent', sortable: true, render: (r) => r.agent ?? '' },
  { key: 'shipping_line', label: 'Shipping Line', sortable: true, render: (r) => r.shipping_line ?? '' },
  { key: 'origin', label: 'Origin', sortable: true, render: (r) => r.origin ?? '' },
  { key: 'origin_port', label: 'POL', sortable: true, render: (r) => r.origin_port ?? '' },
  { key: 'destination', label: 'Destination', sortable: true, render: (r) => r.destination ?? '' },
  { key: 'destination_port', label: 'POD', sortable: true, render: (r) => r.destination_port ?? '' },
  { key: 'tt', label: 'TT', align: 'center', render: (r) => r.tt ?? '' },
  { key: 'cif_usd', label: 'CIF $', align: 'right', render: (r) => money(r.cif_usd) },
  {
    key: 'validity',
    label: 'Validity',
    sortable: true,
    value: (r) => r.validity,
    render: validityCell,
  },
];

export const RoutesPage = () => {
  const navigate = useNavigate();
  const {
    routes, search, setSearch, error,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  } = useRoutesPage();

  return (
    <>
      <ErrorAlert message={error} />

      <DataTable
        title="Routes"
        exportFileName="routes"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by reference, agent, line or port…"
        onAdd={() => navigate('/logistics/routes/new')}
        columns={columns}
        rows={routes}
        getRowId={(r) => r.id}
        onRowClick={(r) => navigate(`/logistics/routes/${r.id}`)}
        onEdit={(r) => navigate(`/logistics/routes/${r.id}`)}
        onDuplicate={(r) => navigate(`/logistics/routes/new?from=${r.id}`)}
        onDelete={handleDelete}
        emptyMessage="No routes."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete route?"
        message={`Delete route "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default RoutesPage;
