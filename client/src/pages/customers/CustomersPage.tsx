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
import Grid2 from '@mui/material/Grid2';
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#222' }}>
          Customers
        </Typography>
        <Button
          variant="contained"
          onClick={() => { setShowForm(v => !v); setError(''); }}
        >
          {showForm ? 'Cancel' : '+ Add Customer'}
        </Button>
      </Box>

      {/* Add form */}
      <Collapse in={showForm}>
        <Card
          elevation={0}
          sx={{
            mb: 3,
            bgcolor: '#fff',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2} color="#222">
              New Customer
            </Typography>
            <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Customer ID"
                size="small"
                required
                value={newId}
                onChange={e => setNewId(e.target.value)}
                placeholder="e.g. CUST-001"
              />
              <TextField
                label="Name"
                size="small"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Customer name"
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Create
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {!showForm && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Customer grid */}
      {customers.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={6}>
          No customers yet.
        </Typography>
      ) : (
        <Grid2 container spacing={2}>
          {customers.map(c => (
            <Grid2 key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#fff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                    borderColor: '#c41230',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/customers/${c.id}/suppliers`)}
                  sx={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 36,
                        height: 4,
                        bgcolor: '#c41230',
                        borderRadius: 1,
                        mb: 1.5,
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight={700} color="#111">
                      {c.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888', fontFamily: 'monospace' }}>
                      {c.id}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1, px: 1 }}>
                  <Button
                    size="small"
                    color="error"
                    onClick={e => handleDelete(e, c.id, c.name)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      )}
    </Box>
  );
}
