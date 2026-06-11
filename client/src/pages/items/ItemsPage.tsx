import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { AddItemForm } from './components/addItemForm/AddItemForm';
import { ItemCard } from './components/itemCard/ItemCard';
import { useItemsPage } from './hooks/useItemsPage';

export const ItemsPage = () => {
  const navigate = useNavigate();
  const {
    customerId, customer, supplier, items,
    showForm, newId, setNewId, newName, setNewName,
    error, toggleForm, handleAdd,
  } = useItemsPage();

  return (
    <Box>
      <Button
        onClick={() => navigate(`/customers/${customerId}/suppliers`)}
        sx={{ mb: 1, p: 0, textTransform: 'none' }}
      >
        ← {customer?.name ?? '…'}
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>{supplier?.name ?? '…'} — Items</Typography>
        <Button variant="contained" onClick={toggleForm}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </Button>
      </Box>

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

      {!showForm && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {items.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={6}>
          No items for this supplier / customer yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid key={item.id}>
              <ItemCard item={item} onOpen={() => navigate(`/items/${item.id}`)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ItemsPage;
