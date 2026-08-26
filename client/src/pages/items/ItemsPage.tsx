import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { ItemFormDialog } from './components/itemFormDialog/ItemFormDialog';
import { useItemsPage } from './hooks/useItemsPage';
import { DataTable, ErrorAlert, PageHeader, SearchBar, type Column } from '../../components';
import type { Item } from '../../api';

const columns: Column<Item>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'supplier_name', label: 'Supplier', sortable: true, render: (r) => r.supplier_name ?? r.supplier_id },
  { key: 'name', label: 'Description', sortable: true },
  { key: 'size', label: 'Size', render: (r) => r.size ?? '' },
  { key: 'unit_weight', label: 'Unit Weight', align: 'right', render: (r) => r.unit_weight ?? '' },
  { key: 'units_in_case', label: 'Units / Case', align: 'right', render: (r) => r.units_in_case ?? '' },
  { key: 'cases_in_fcl', label: 'Cases / FCL', align: 'right', render: (r) => r.cases_in_fcl ?? '' },
];

export const ItemsPage = () => {
  const navigate = useNavigate();
  const {
    items, suppliers, search, setSearch,
    dialogOpen, openAdd, closeDialog, error, handleSubmit,
  } = useItemsPage();

  return (
    <>
      <PageHeader title="Items" actionLabel="+ Add Item" onAction={openAdd} />

      {!dialogOpen && <ErrorAlert message={error} />}

      <Box sx={{ mb: 2 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by description, supplier or ID…" />
      </Box>

      <DataTable
        columns={columns}
        rows={items}
        getRowId={(i) => i.id}
        onRowClick={(i) => navigate(`/items/${i.id}`)}
        emptyMessage="No items."
      />

      <ItemFormDialog
        open={dialogOpen}
        suppliers={suppliers}
        error={error}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default ItemsPage;
