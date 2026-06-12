import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { AddItemForm } from './components/addItemForm/AddItemForm';
import { ItemRow } from './components/itemRow/ItemRow';
import { useItemsPage } from './hooks/useItemsPage';
import { EmptyState, ErrorAlert, PageHeader, SearchBar } from '../../components';

export const ItemsPage = () => {
  const navigate = useNavigate();
  const {
    customerId, customer, supplier, items,
    showForm, newId, setNewId, newName, setNewName,
    search, setSearch, error, toggleForm, handleAdd,
  } = useItemsPage();

  return (
    <>
      <PageHeader
        title={`${supplier?.name ?? '…'} — Items`}
        actionLabel="+ Add Item"
        actionActive={showForm}
        onAction={toggleForm}
        backButton={
          <Button
            onClick={() => navigate(`/customers/${customerId}/suppliers`)}
            sx={{ p: 0, textTransform: 'none' }}
          >
            ← {customer?.name ?? '…'}
          </Button>
        }
      />

      <Collapse in={showForm}>
        <AddItemForm
          newId={newId}
          setNewId={setNewId}
          newName={newName}
          setNewName={setNewName}
          error={error}
          onSubmit={handleAdd}
        />
      </Collapse>

      {!showForm && <ErrorAlert message={error} />}

      <Box sx={{ mb: 2 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID…" />
      </Box>

      {items.length === 0 ? (
        <EmptyState message={search ? 'No items match your search.' : 'No items for this supplier / customer yet.'} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((item) => (
            <ItemRow key={item.id} item={item} onOpen={() => navigate(`/items/${item.id}`)} />
          ))}
        </Box>
      )}
    </>
  );
};

export default ItemsPage;
