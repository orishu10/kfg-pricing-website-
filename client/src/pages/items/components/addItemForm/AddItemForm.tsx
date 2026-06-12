import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CommonInput, ErrorAlert } from '../../../../components';

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
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        New Item
      </Typography>
      <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CommonInput
          label="Item ID"
          size="small"
          required
          value={newId}
          onChange={setNewId}
          placeholder="e.g. ITEM-001"
        />
        <CommonInput
          label="Name"
          size="small"
          required
          value={newName}
          onChange={setNewName}
          placeholder="Item name"
        />
        <ErrorAlert message={error} />
        <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
          Create
        </Button>
      </Box>
    </CardContent>
  </Card>
);
