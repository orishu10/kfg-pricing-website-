import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { Supplier } from '../../../../api';
import { CommonInput, CommonSelect, ErrorAlert } from '../../../../components';

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
          <CommonInput
            label="Supplier Name"
            size="small"
            required
            value={newName}
            onChange={setNewName}
            placeholder="Supplier name"
          />
          <ErrorAlert message={error} />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            Create &amp; Link
          </Button>
        </Box>
      )}

      {tab === 1 && (
        <Box component="form" onSubmit={onLinkExisting} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CommonSelect
            label="Select Supplier"
            size="small"
            required
            value={linkId}
            onChange={setLinkId}
            options={unlinkableSuppliers.map((s) => ({ label: `${s.name} (#${s.id})`, value: String(s.id) }))}
            placeholder="— select —"
          />
          <ErrorAlert message={error} />
          <Button type="submit" variant="contained" disabled={!linkId} sx={{ alignSelf: 'flex-start' }}>
            Link
          </Button>
        </Box>
      )}
    </CardContent>
  </Card>
);
