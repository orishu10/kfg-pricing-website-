import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { CommonInput, ErrorAlert } from '../../../components';
import { SHIPMENT_SECTIONS, type ShipmentSelectableKey } from '../../logistics/weeklyShipments/utils/consts';
import { orderedFields } from '../utils/helpers';
import type { ShipmentFormat, ShipmentFormatPayload } from '../../../api';
import { FormatSectionPicker } from './FormatSectionPicker';

interface FormatFormDialogProps {
  open: boolean;
  initial: ShipmentFormat | null;
  error: string;
  onClose: () => void;
  onSubmit: (payload: ShipmentFormatPayload) => void;
}

export const FormatFormDialog = ({ open, initial, error, onClose, onSubmit }: FormatFormDialogProps) => {
  const [name, setName] = useState('');
  const [fields, setFields] = useState<ShipmentSelectableKey[]>([]);
  const [activeSectionKey, setActiveSectionKey] = useState(SHIPMENT_SECTIONS[0].key);

  const formKey = open ? `${initial?.id ?? 'new'}:${initial?.updated_at ?? ''}` : null;
  const [loadedFormKey, setLoadedFormKey] = useState<string | null>(null);
  if (formKey !== loadedFormKey) {
    setLoadedFormKey(formKey);
    if (open) {
      setName(initial?.name ?? '');
      setFields((initial?.fields ?? []) as ShipmentSelectableKey[]);
      setActiveSectionKey(SHIPMENT_SECTIONS[0].key);
    }
  }

  const activeSection =
    SHIPMENT_SECTIONS.find((candidate) => candidate.key === activeSectionKey) ?? SHIPMENT_SECTIONS[0];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ name: name.trim(), fields: orderedFields(fields) });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, px: 3, pt: 2.5, pb: 1.5 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800}>
              {initial ? `Format ${initial.name}` : 'New Format'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fields.length} field{fields.length === 1 ? '' : 's'} selected
            </Typography>
          </Box>
          <Box sx={{ width: 260 }}>
            <CommonInput label="Format Name" size="small" required value={name} onChange={setName} />
          </Box>
          <IconButton onClick={onClose} aria-label="Close" sx={{ mb: 0.25 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs
          value={activeSection.key}
          onChange={(_event, value: string) => setActiveSectionKey(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider', minHeight: 38 }}
        >
          {SHIPMENT_SECTIONS.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              label={tab.label}
              sx={{ minHeight: 38, py: 0, fontSize: '0.72rem', fontWeight: 700 }}
            />
          ))}
        </Tabs>

        <DialogContent sx={{ pt: 2 }}>
          <FormatSectionPicker section={activeSection} fields={fields} onChange={setFields} />
          <Box sx={{ mt: 2 }}>
            <ErrorAlert message={error} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={!name.trim() || fields.length === 0}>
            {initial ? 'Save Format' : 'Create Format'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
