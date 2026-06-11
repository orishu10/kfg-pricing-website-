import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface AddCustomerFormProps {
  newId: string;
  setNewId: (v: string) => void;
  newName: string;
  setNewName: (v: string) => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddCustomerForm = ({ newId, setNewId, newName, setNewName, error, onSubmit }: AddCustomerFormProps) => (
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
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Customer ID"
          size="small"
          required
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          placeholder="e.g. CUST-001"
        />
        <TextField
          label="Name"
          size="small"
          required
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Customer name"
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
          Create
        </Button>
      </Box>
    </CardContent>
  </Card>
);
