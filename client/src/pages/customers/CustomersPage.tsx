import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { AddCustomerForm } from './components/addCustomerForm/AddCustomerForm';
import { CustomerRow } from './components/customerRow/CustomerRow';
import { useCustomersPage } from './hooks/useCustomersPage';
import { ConfirmDialog, EmptyState, ErrorAlert, PageHeader, SearchBar } from '../../components';

export const CustomersPage = () => {
  const navigate = useNavigate();
  const {
    customers, showForm, newId, setNewId, newName, setNewName,
    search, setSearch, error, deleteTarget, setDeleteTarget,
    toggleForm, handleAdd, handleDelete, confirmDelete,
  } = useCustomersPage();

  return (
    <>
      <PageHeader
        title="Customers"
        actionLabel="+ Add Customer"
        actionActive={showForm}
        onAction={toggleForm}
      />

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

      {!showForm && <ErrorAlert message={error} />}

      <Box sx={{ mb: 2 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID…" />
      </Box>

      {customers.length === 0 ? (
        <EmptyState message={search ? 'No customers match your search.' : 'No customers yet.'} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {customers.map((c) => (
            <CustomerRow
              key={c.id}
              customer={c}
              onOpen={() => navigate(`/customers/${c.id}/suppliers`)}
              onDelete={(e) => handleDelete(e, c.id, c.name)}
            />
          ))}
        </Box>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete customer?"
        message={`Delete "${deleteTarget?.name}"? This will also remove all their supplier links and items.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default CustomersPage;
