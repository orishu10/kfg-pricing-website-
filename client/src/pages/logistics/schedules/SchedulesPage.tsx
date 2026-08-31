import { useNavigate } from 'react-router-dom';
import { useSchedulesPage } from './hooks/useSchedulesPage';
import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../../components';
import { WeekSelector } from '../components/WeekSelector';
import { fmtDate } from '../../pricing/utils/helpers';
import type { Schedule } from '../../../api';

const columns: Column<Schedule>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'vessel', label: 'Vessel', sortable: true, render: (r) => r.vessel ?? '' },
  { key: 'voyage', label: 'Voyage', mono: true, render: (r) => r.voyage ?? '' },
  { key: 'pol', label: 'POL', render: (r) => r.pol ?? '' },
  { key: 'pod', label: 'POD', render: (r) => r.pod ?? '' },
  { key: 'etd', label: 'ETD', sortable: true, value: (r) => r.etd, render: (r) => fmtDate(r.etd) },
  { key: 'eta', label: 'ETA', sortable: true, value: (r) => r.eta, render: (r) => fmtDate(r.eta) },
  { key: 'tt', label: 'TT', render: (r) => r.tt ?? '' },
  { key: 'ddl_con', label: 'DDL CON #', render: (r) => r.ddl_con ?? '' },
  { key: 'ddl_docs', label: 'DDL Docs', render: (r) => r.ddl_docs ?? '' },
  { key: 'ddl_port', label: 'DDL Port', render: (r) => r.ddl_port ?? '' },
];

export const SchedulesPage = () => {
  const navigate = useNavigate();
  const {
    rows, monday, setMonday, search, setSearch, error,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  } = useSchedulesPage();

  return (
    <>
      <ErrorAlert message={error} />

      <DataTable
        title="Schedules"
        exportFileName="schedules"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by vessel, voyage or port…"
        onAdd={() => navigate('/logistics/schedules/new')}
        headerCenter={<WeekSelector monday={monday} onChange={setMonday} />}
        disableFilters
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        onRowClick={(r) => navigate(`/logistics/schedules/${r.id}`)}
        onEdit={(r) => navigate(`/logistics/schedules/${r.id}`)}
        onDuplicate={(r) => navigate(`/logistics/schedules/new?from=${r.id}`)}
        onDelete={handleDelete}
        emptyMessage="No schedules this week."
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete schedule?"
        message={`Delete schedule "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default SchedulesPage;
