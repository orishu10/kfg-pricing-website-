import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import type { Supplier } from '../../../../api';

interface AddSupplierFormProps {
  tab: number;
  setTab: (v: number) => void;
  newName: string;
  setNewName: (v: string) => void;
  linkId: string;
  setLinkId: (v: string) => void;
  unlinkableSuppliers: Supplier[];
  error: string;
  onAddNew: (e: React.FormEvent) => void;
  onLinkExisting: (e: React.FormEvent) => void;
}

export const AddSupplierForm = ({
  tab, setTab, newName, setNewName, linkId, setLinkId,
  unlinkableSuppliers, error, onAddNew, onLinkExisting,
}: AddSupplierFormProps) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="New Supplier" />
        <Tab label="Link Existing" />
      </Tabs>

      {tab === 0 && (
        <Box component="form" onSubmit={onAddNew} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Supplier Name" size="small" required
            value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Supplier name"
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>Create & Link</Button>
        </Box>
      )}

      {tab === 1 && (
        <Box component="form" onSubmit={onLinkExisting} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl size="small" required>
            <InputLabel>Select Supplier</InputLabel>
            <Select value={linkId} label="Select Supplier" onChange={(e) => setLinkId(e.target.value)}>
              {unlinkableSuppliers.map((s) => (
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
);
