import { useMemo, useState } from 'react';
import { DataTable, type Column } from '../../components';
import { WeekSelector } from './components/WeekSelector';
import { fmtDate } from '../pricing/utils/helpers';
import { isInWeek, weekStart } from './utils/week';

interface Schedule {
  id: string;
  no: string;
  vessel: string;
  voyage: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  tt: string;
  ddl_con: string;
  ddl_docs: string;
  ddl_port: string;
}

const columns: Column<Schedule>[] = [
  { key: 'no', label: '#', mono: true, align: 'center' },
  { key: 'vessel', label: 'Vessel', sortable: true },
  { key: 'voyage', label: 'Voyage', mono: true },
  { key: 'pol', label: 'POL' },
  { key: 'pod', label: 'POD' },
  { key: 'etd', label: 'ETD', sortable: true, render: (r) => fmtDate(r.etd) },
  { key: 'eta', label: 'ETA', sortable: true, render: (r) => fmtDate(r.eta) },
  { key: 'tt', label: 'TT' },
  { key: 'ddl_con', label: 'DDL CON #' },
  { key: 'ddl_docs', label: 'DDL Docs' },
  { key: 'ddl_port', label: 'DDL Port' },
];

const searchText = (s: Schedule) =>
  [s.no, s.vessel, s.voyage, s.pol, s.pod, s.tt].join(' ').toLowerCase();

const MOCK: Schedule[] = [
  { id: '1', no: '01', vessel: 'MSC Paris', voyage: 'IU129A', pol: 'Ashdod', pod: 'New York', etd: '2026-08-31', eta: '2026-09-14', tt: '40 DAYS Trans', ddl_con: '31-Aug-21 12:00AM', ddl_docs: '31-Aug-21 12:00AM', ddl_port: '31-Aug-21 12:00AM' },
  { id: '2', no: '02', vessel: 'MSC Valencia', voyage: 'IU130A', pol: 'Haifa', pod: 'New York', etd: '2026-09-01', eta: '2026-09-11', tt: '10 DAYS Direct', ddl_con: '01-Sep-21 13:00AM', ddl_docs: '01-Sep-21 13:00AM', ddl_port: '01-Sep-21 13:00AM' },
  { id: '3', no: '03', vessel: 'ZIM Luanda', voyage: '88E', pol: 'Haifa', pod: 'Felixtowe', etd: '2026-09-02', eta: '2026-09-16', tt: '14 DAYS Direct', ddl_con: '02-Sep-21 20:00PM', ddl_docs: '02-Sep-21 20:00PM', ddl_port: '02-Sep-21 20:00PM' },
  { id: '4', no: '04', vessel: 'Cosco America', voyage: '072S', pol: 'Haifa', pod: 'Felixtowe', etd: '2026-09-04', eta: '2026-09-16', tt: '12 DAYS Direct', ddl_con: '04-Sep-21 20:00PM', ddl_docs: '04-Sep-21 20:00PM', ddl_port: '04-Sep-21 20:00PM' },
];

export const SchedulesPage = () => {
  const [monday, setMonday] = useState(() => weekStart(new Date()));
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK.filter((s) => isInWeek(s.etd, monday) && (!q || searchText(s).includes(q)));
  }, [monday, search]);

  return (
    <DataTable
      title="Schedules"
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      disableFilters
      headerCenter={<WeekSelector monday={monday} onChange={setMonday} />}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search schedules…"
      onAdd={() => {}}
      emptyMessage="No schedules this week."
    />
  );
};

export default SchedulesPage;
