import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { AddSupplierForm } from './components/addSupplierForm/AddSupplierForm';
import { SupplierCard } from './components/supplierCard/SupplierCard';
import { useSuppliersPage } from './hooks/useSuppliersPage';

export const SuppliersPage = () => {
  const navigate = useNavigate();
  const {
    customerId, customer, suppliers, unlinkableSuppliers,
    showForm, tab, setTab, newName, setNewName, linkId, setLinkId,
    error, toggleForm, handleAddNew, handleLinkExisting,
  } = useSuppliersPage();

  return (
    <Box>
      <Button onClick={() => navigate('/customers')} sx={{ mb: 1, p: 0, textTransform: 'none' }}>
        ← Customers
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {customer?.name ?? '…'} — Suppliers
        </Typography>
        <Button variant="contained" onClick={toggleForm}>
          {showForm ? 'Cancel' : '+ Add Supplier'}
        </Button>
      </Box>

      <Collapse in={showForm}>
        <AddSupplierForm
          tab={tab}
          setTab={setTab}
          newName={newName}
          setNewName={setNewName}
          linkId={linkId}
          setLinkId={setLinkId}
          unlinkableSuppliers={unlinkableSuppliers}
          error={error}
          onAddNew={handleAddNew}
          onLinkExisting={handleLinkExisting}
        />
      </Collapse>

      {!showForm && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {suppliers.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={6}>
          No suppliers linked to this customer yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {suppliers.map((s) => (
            <Grid size={{ xs: 12, sm: 6 }} key={s.id}>
              <SupplierCard
                supplier={s}
                onOpen={() => navigate(`/customers/${customerId}/suppliers/${s.id}/items`)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SuppliersPage;
