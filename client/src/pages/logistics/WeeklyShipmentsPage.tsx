import { useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { DataTable, type Column } from '../../components';
import { WeekSelector } from './components/WeekSelector';
import { fmtDate } from '../pricing/utils/helpers';
import { isInWeek, weekStart } from './utils/week';

interface Shipment {
  id: string;
  log_no: string;
  con: string;
  customer: string;
  supplier: string;
  description: string;
  pup: string;
  pol: string;
  pod: string;
  vessel: string;
  voyage: string;
  etd: string;
  eta: string;
  booked: boolean;
}

const buildColumns = (onToggleBooked: (id: string) => void): Column<Shipment>[] => [
  { key: 'log_no', label: 'LOG #', mono: true, align: 'center' },
  { key: 'con', label: 'CON' },
  { key: 'customer', label: 'Customer', sortable: true },
  { key: 'supplier', label: 'Supplier', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'pup', label: 'PUP' },
  { key: 'pol', label: 'POL' },
  { key: 'pod', label: 'POD' },
  {
    key: 'vessel',
    label: 'Schedule',
    render: (r) => (
      <Box>
        <Typography sx={{ fontSize: '0.85rem' }}>{r.vessel}</Typography>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>V: {r.voyage}</Typography>
      </Box>
    ),
  },
  { key: 'etd', label: 'ETD', sortable: true, render: (r) => fmtDate(r.etd) },
  { key: 'eta', label: 'ETA', sortable: true, render: (r) => fmtDate(r.eta) },
  {
    key: 'booked',
    label: 'Booking',
    align: 'center',
    render: (r) => (
      <Checkbox size="small" checked={r.booked} onChange={() => onToggleBooked(r.id)} sx={{ p: 0 }} />
    ),
  },
];

const searchText = (s: Shipment) =>
  [s.log_no, s.con, s.customer, s.supplier, s.description, s.pup, s.pol, s.pod, s.vessel, s.voyage]
    .join(' ')
    .toLowerCase();

const MOCK: Shipment[] = [
  { id: '1', log_no: '01', con: '40FT/HC/DRY', customer: 'Bertram', supplier: 'Fogel, Einat, Berman', description: 'Jams, Bread and Baked', pup: 'Ashdod', pol: 'Ashdod', pod: 'New York', vessel: 'MSC Qingdao', voyage: 'IU117A', etd: '2026-08-31', eta: '2026-09-14', booked: true },
  { id: '2', log_no: '02', con: '40FT/HC/DRY', customer: 'Bertram', supplier: 'Besler', description: 'Pasta', pup: 'Ashdod', pol: 'Haifa', pod: 'New York', vessel: 'MSC Lorena', voyage: 'MD118R', etd: '2026-09-01', eta: '2026-09-11', booked: true },
  { id: '3', log_no: '03', con: '40FT/HC/REF', customer: 'Hatov', supplier: 'Strauss', description: 'Ice Cream', pup: 'Ashdod', pol: 'Haifa', pod: 'Felixtowe', vessel: 'ZIM Europe', voyage: '61W', etd: '2026-09-02', eta: '2026-09-16', booked: false },
  { id: '4', log_no: '04', con: '40FT/HC/DRY', customer: 'Kemach', supplier: 'EH', description: 'Bread and Baked', pup: 'Haifa', pol: 'Haifa', pod: 'New York', vessel: 'Cosco Trouper', voyage: '117W', etd: '2026-09-04', eta: '2026-09-14', booked: true },
];

export const WeeklyShipmentsPage = () => {
  const [monday, setMonday] = useState(() => weekStart(new Date()));
  const [search, setSearch] = useState('');
  const [shipments, setShipments] = useState<Shipment[]>(MOCK);

  const toggleBooked = useCallback((id: string) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, booked: !s.booked } : s)));
  }, []);

  const columns = useMemo(() => buildColumns(toggleBooked), [toggleBooked]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments.filter((s) => isInWeek(s.etd, monday) && (!q || searchText(s).includes(q)));
  }, [shipments, monday, search]);

  return (
    <DataTable
      title="Weekly Shipments"
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      disableFilters
      headerCenter={<WeekSelector monday={monday} onChange={setMonday} />}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search shipments…"
      onAdd={() => {}}
      emptyMessage="No shipments this week."
    />
  );
};

export default WeeklyShipmentsPage;
