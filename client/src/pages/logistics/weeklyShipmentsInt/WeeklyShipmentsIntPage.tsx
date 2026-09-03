import { useWeeklyShipmentsIntPage } from './hooks/useWeeklyShipmentsIntPage';
import { DataTable } from '../../../components';
import { WeekSelector } from '../components/WeekSelector';
import { buildShipmentColumns } from '../components/shipmentColumns';

export const WeeklyShipmentsIntPage = () => {
  const { rows, monday, setMonday, search, setSearch } = useWeeklyShipmentsIntPage();

  const columns = buildShipmentColumns();

  const handleAdd = () => undefined;

  return (
    <DataTable
      title="Weekly Shipments INT"
      exportFileName="weekly-shipments-int"
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by customer, supplier, vessel or port…"
      onAdd={handleAdd}
      headerCenter={<WeekSelector monday={monday} onChange={setMonday} />}
      disableFilters
      fitWidth
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      emptyMessage="No shipments this week."
    />
  );
};

export default WeeklyShipmentsIntPage;
