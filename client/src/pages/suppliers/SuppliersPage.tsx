import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { AddSupplierForm } from './components/addSupplierForm/AddSupplierForm';
import { SupplierRow } from './components/supplierRow/SupplierRow';
import { useSuppliersPage } from './hooks/useSuppliersPage';
import { EmptyState, ErrorAlert, PageHeader, SearchBar } from '../../components';

export const SuppliersPage = () => {
  const navigate = useNavigate();
  const {
    customerId, customer, suppliers, unlinkableSuppliers,
    showForm, tab, setTab, newName, setNewName, linkId, setLinkId,
    search, setSearch, error, toggleForm, handleAddNew, handleLinkExisting,
  } = useSuppliersPage();

  return (
    <>
      <PageHeader
        title={`${customer?.name ?? '…'} — Suppliers`}
        actionLabel="+ Add Supplier"
        actionActive={showForm}
        onAction={toggleForm}
        backButton={
          <Button onClick={() => navigate('/customers')} sx={{ p: 0, textTransform: 'none' }}>
            ← Customers
          </Button>
        }
      />

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

      {!showForm && <ErrorAlert message={error} />}

      <Box sx={{ mb: 2 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID…" />
      </Box>

      {suppliers.length === 0 ? (
        <EmptyState message={search ? 'No suppliers match your search.' : 'No suppliers linked to this customer yet.'} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {suppliers.map((s) => (
            <SupplierRow
              key={s.id}
              supplier={s}
              onOpen={() => navigate(`/customers/${customerId}/suppliers/${s.id}/items`)}
            />
          ))}
        </Box>
      )}
    </>
  );
};

export default SuppliersPage;
