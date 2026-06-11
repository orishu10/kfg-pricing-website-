import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface AddItemFormProps {
  newId: string;
  setNewId: (v: string) => void;
  newName: string;
  setNewName: (v: string) => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddItemForm = ({ newId, setNewId, newName, setNewName, error, onSubmit }: AddItemFormProps) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>New Item</Typography>
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Item ID" size="small" required
          value={newId} onChange={(e) => setNewId(e.target.value)}
          placeholder="e.g. ITEM-001"
        />
        <TextField
          label="Name" size="small" required
          value={newName} onChange={(e) => setNewName(e.target.value)}
          placeholder="Item name"
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>Create</Button>
      </Box>
    </CardContent>
  </Card>
);
