import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { getCustomers, createCustomer, deleteCustomer, type Customer } from '../../api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = () =>
    getCustomers().then(setCustomers).catch(() => setError('Failed to load customers'));

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createCustomer({ id: newId.trim(), name: newName.trim() });
      setNewId('');
      setNewName('');
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create customer');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete customer "${name}"? This will also remove all their supplier links and items.`)) return;
    try {
      await deleteCustomer(id);
      load();
    } catch {
      setError('Failed to delete customer');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Customers</Typography>
        <Button variant="contained" onClick={() => { setShowForm(v => !v); setError(''); }}>
          {showForm ? 'Cancel' : '+ Add Customer'}
        </Button>
      </Box>

      <Collapse in={showForm}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>New Customer</Typography>
            <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Customer ID" size="small" required
                value={newId} onChange={e => setNewId(e.target.value)}
                placeholder="e.g. CUST-001"
              />
              <TextField
                label="Name" size="small" required
                value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Customer name"
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>Create</Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {!showForm && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {customers.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={6}>No customers yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {customers.map(c => (
            <Grid size={{ xs: 12, sm: 6 }} key={c.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea
                  onClick={() => navigate(`/customers/${c.id}/suppliers`)}
                  sx={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">{c.id}</Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <Button size="small" color="error" onClick={e => handleDelete(e, c.id, c.name)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
