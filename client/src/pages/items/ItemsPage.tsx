import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  getCustomer, getCustomerSuppliers, getSupplierItems,
  createItem, type Item, type Customer, type Supplier
} from '../../api';

export default function ItemsPage() {
  const { customerId, supplierId } = useParams<{ customerId: string; supplierId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const loadItems = () =>
    getSupplierItems(Number(supplierId), customerId!).then(setItems).catch(() => setError('Failed to load items'));

  useEffect(() => {
    getCustomer(customerId!).then(setCustomer).catch(() => navigate('/'));
    getCustomerSuppliers(customerId!).then(list => {
      const found = list.find(s => s.id === Number(supplierId));
      if (!found) navigate(`/customers/${customerId}/suppliers`);
      else setSupplier(found);
    });
    loadItems();
    // navigate and loadItems are stable references — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, supplierId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createItem({
        id: newId.trim(),
        name: newName.trim(),
        customer_id: customerId!,
        supplier_id: Number(supplierId),
      });
      setNewId('');
      setNewName('');
      setShowForm(false);
      loadItems();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create item');
    }
  };

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
        <Button variant="contained" onClick={() => { setShowForm(v => !v); setError(''); }}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </Button>
      </Box>

      <Collapse in={showForm}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>New Item</Typography>
            <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Item ID" size="small" required
                value={newId} onChange={e => setNewId(e.target.value)}
                placeholder="e.g. ITEM-001"
              />
              <TextField
                label="Name" size="small" required
                value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Item name"
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>Create</Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {!showForm && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {items.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={6}>
          No items for this supplier / customer yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map(item => (
            <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => navigate(`/items/${item.id}`)} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>{item.name}</Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">{item.id}</Typography>
                    {item.total != null && (
                      <Typography variant="body2" color="success.main" fontWeight={600} mt={1}>
                        ${parseFloat(item.total).toFixed(2)}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
