import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import type { Column } from '../../../components';
import { fmtDate } from '../../pricing/utils/helpers';
import type { WeeklyShipment } from '../../../api';

const supplierLabel = (shipment: WeeklyShipment) =>
  shipment.suppliers?.length ? shipment.suppliers.join(', ') : shipment.supplier ?? '';

export const buildShipmentColumns = (
  onToggleBooked?: (shipment: WeeklyShipment) => void,
): Column<WeeklyShipment>[] => [
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
        disabled={!onToggleBooked}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggleBooked?.(r)}
        sx={{ p: 0 }}
      />
    ),
  },
];
