import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { ErrorAlert } from '../../../../components';
import { FormSelect } from '../../components/form';
import { useShipmentFormOptions } from '../hooks/useShipmentFormOptions';
import {
  ALL_FIELDS_FORMAT_NAME, EMPTY_SHIPMENT, SHIPMENT_STATUS_OPTIONS,
  type ShipmentFieldKey, type ShipmentForm, type ShipmentRowKey,
} from '../utils/consts';
import { formToInput, formatFields, shipmentToForm, visibleSections } from '../utils/helpers';
import type { ShipmentDocumentRow, ShipmentFormat, WeeklyShipment, WeeklyShipmentInput } from '../../../../api';
import { ShipmentSection } from './ShipmentSection';

interface ShipmentFormDialogProps {
  open: boolean;
  source: WeeklyShipment | null;
  isEdit: boolean;
  format: ShipmentFormat | null;
  error: string;
  onClose: () => void;
  onSubmit: (payload: WeeklyShipmentInput) => void;
}

export const ShipmentFormDialog = ({
  open, source, isEdit, format, error, onClose, onSubmit,
}: ShipmentFormDialogProps) => {
  const { routeOptions } = useShipmentFormOptions();
  const [form, setForm] = useState<ShipmentForm>(EMPTY_SHIPMENT);
  const [activeSectionKey, setActiveSectionKey] = useState('');

  const sections = visibleSections(formatFields(format));
  const activeSection = sections.find((candidate) => candidate.key === activeSectionKey) ?? sections[0];

  const formKey = open
    ? `${isEdit ? 'edit' : 'new'}:${source?.id ?? ''}:${source?.updated_at ?? ''}:${format?.id ?? 'all'}`
    : null;
  const [loadedFormKey, setLoadedFormKey] = useState<string | null>(null);
  if (formKey !== loadedFormKey) {
    setLoadedFormKey(formKey);
    if (open) {
      setForm(source ? shipmentToForm(source) : EMPTY_SHIPMENT);
      setActiveSectionKey(sections[0]?.key ?? '');
    }
  }

  const setField = (key: ShipmentFieldKey) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const setSuppliers = (suppliers: string[]) => setForm((previous) => ({ ...previous, suppliers }));

  const setRows = (key: ShipmentRowKey, rows: ShipmentDocumentRow[]) =>
    setForm((previous) => ({ ...previous, [key]: rows }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formToInput(form, format?.id ?? null));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, px: 3, pt: 2.5, pb: 1.5 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800}>
              {isEdit && source ? `Shipment ${source.id}` : 'New Shipment'}
            </Typography>
            <Chip size="small" label={format?.name ?? ALL_FIELDS_FORMAT_NAME} sx={{ mt: 0.5 }} />
          </Box>
          <Box sx={{ width: 170 }}>
            <FormSelect label="Route" value={form.route} onChange={setField('route')} options={routeOptions} />
          </Box>
          <Box sx={{ width: 150 }}>
            <FormSelect
              label="Status"
              value={form.status}
              onChange={setField('status')}
              options={SHIPMENT_STATUS_OPTIONS}
            />
          </Box>
          <IconButton onClick={onClose} aria-label="Close" sx={{ mb: 0.25 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs
          value={activeSection?.key ?? false}
          onChange={(_event, value: string) => setActiveSectionKey(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider', minHeight: 38 }}
        >
          {sections.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              label={tab.label}
              sx={{ minHeight: 38, py: 0, fontSize: '0.72rem', fontWeight: 700 }}
            />
          ))}
        </Tabs>

        <DialogContent sx={{ pt: 2 }}>
          {activeSection && (
            <ShipmentSection
              section={activeSection}
              form={form}
              setField={setField}
              setSuppliers={setSuppliers}
              setRows={setRows}
            />
          )}
          <Box sx={{ mt: 2 }}>
            <ErrorAlert message={error} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
