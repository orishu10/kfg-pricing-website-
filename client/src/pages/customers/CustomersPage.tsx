import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { AddCustomerForm } from './components/addCustomerForm/AddCustomerForm';
import { CustomerCard } from './components/customerCard/CustomerCard';
import { useCustomersPage } from './hooks/useCustomersPage';

export const CustomersPage = () => {
  const navigate = useNavigate();
  const {
    customers, showForm, newId, setNewId, newName, setNewName,
    error, toggleForm, handleAdd, handleDelete,
  } = useCustomersPage();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#222' }}>
          Customers
        </Typography>
        <Button variant="contained" onClick={toggleForm}>
          {showForm ? 'Cancel' : '+ Add Customer'}
        </Button>
      </Box>

      {/* Add form */}
      <Collapse in={showForm}>
        <AddCustomerForm
          newId={newId}
          setNewId={setNewId}
          newName={newName}
          setNewName={setNewName}
          error={error}
          onSubmit={handleAdd}
        />
      </Collapse>

      {!showForm && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Customer grid */}
      {customers.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={6}>
          No customers yet.
        </Typography>
      ) : (
        <Grid2 container spacing={2}>
          {customers.map((c) => (
            <Grid2 key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomerCard
                customer={c}
                onOpen={() => navigate(`/customers/${c.id}/suppliers`)}
                onDelete={(e) => handleDelete(e, c.id, c.name)}
              />
            </Grid2>
          ))}
        </Grid2>
      )}
    </Box>
  );
};

export default CustomersPage;
