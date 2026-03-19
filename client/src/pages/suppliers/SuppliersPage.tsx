import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  getCustomer, getCustomerSuppliers, getAllSuppliers,
  createSupplier, linkSupplierToCustomer,
  type Customer, type Supplier
} from '../../api';

export default function SuppliersPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState(0);
  const [newName, setNewName] = useState('');
  const [linkId, setLinkId] = useState('');
  const [error, setError] = useState('');

  const loadSuppliers = () =>
    getCustomerSuppliers(customerId!).then(setSuppliers).catch(() => setError('Failed to load suppliers'));

  useEffect(() => {
    getCustomer(customerId!).then(setCustomer).catch(() => navigate('/'));
    loadSuppliers();
    getAllSuppliers().then(setAllSuppliers);
    // navigate and loadSuppliers are stable references — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createSupplier({ name: newName.trim(), customer_id: customerId });
      setNewName('');
      setShowForm(false);
      loadSuppliers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create supplier');
    }
  };

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await linkSupplierToCustomer(Number(linkId), customerId!);
      setLinkId('');
      setShowForm(false);
      loadSuppliers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to link supplier');
    }
  };

  const linkedIds = new Set(suppliers.map(s => s.id));
  const unlinkableSuppliers = allSuppliers.filter(s => !linkedIds.has(s.id));

  return (
    <Box>
      <Button onClick={() => navigate('/')} sx={{ mb: 1, p: 0, textTransform: 'none' }}>
        ← Customers
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {customer?.name ?? '…'} — Suppliers
        </Typography>
        <Button variant="contained" onClick={() => { setShowForm(v => !v); setError(''); }}>
          {showForm ? 'Cancel' : '+ Add Supplier'}
        </Button>
      </Box>

      <Collapse in={showForm}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="New Supplier" />
              <Tab label="Link Existing" />
            </Tabs>

            {tab === 0 && (
              <Box component="form" onSubmit={handleAddNew} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Supplier Name" size="small" required
                  value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Supplier name"
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>Create & Link</Button>
              </Box>
            )}

            {tab === 1 && (
              <Box component="form" onSubmit={handleLinkExisting} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl size="small" required>
                  <InputLabel>Select Supplier</InputLabel>
                  <Select value={linkId} label="Select Supplier" onChange={e => setLinkId(e.target.value)}>
                    {unlinkableSuppliers.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.name} (#{s.id})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" disabled={!linkId} sx={{ alignSelf: 'flex-start' }}>Link</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {!showForm && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {suppliers.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={6}>
          No suppliers linked to this customer yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {suppliers.map(s => (
            <Grid item xs={12} sm={6} key={s.id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea
                  onClick={() => navigate(`/customers/${customerId}/suppliers/${s.id}/items`)}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">#{s.id}</Typography>
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
