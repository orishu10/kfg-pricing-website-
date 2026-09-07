import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { AppDialog, SectionNav } from '../../../../components';
import { FormSelect } from '../../components/form';
import { useShipmentFormOptions } from '../hooks/useShipmentFormOptions';
import { changedFieldCount } from '../../../../utils/forms';
import { timeAgo } from '../../../../utils/time';
import {
  ALL_FIELDS_FORMAT_NAME, EMPTY_SHIPMENT, SHIPMENT_STATUS_OPTIONS, SHIPMENT_STATUS_STYLES,
  type ShipmentFieldKey, type ShipmentForm, type ShipmentRowKey,
} from '../utils/consts';
import {
  formToInput, formatFields, sectionFieldCounts, shipmentEyebrow, shipmentSummary, shipmentToForm, visibleSections,
} from '../utils/helpers';
import type { ShipmentDocumentRow, ShipmentFormat, WeeklyShipment, WeeklyShipmentInput } from '../../../../api';
import { ShipmentSection } from './ShipmentSection';

interface ShipmentFormDialogProps {
  open: boolean;
  source: WeeklyShipment | null;
  isEdit: boolean;
  format: ShipmentFormat | null;
  error: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: WeeklyShipmentInput) => void;
}

export const ShipmentFormDialog = ({
  open, source, isEdit, format, error, saving, onClose, onSubmit,
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

  const initialForm = source ? shipmentToForm(source) : EMPTY_SHIPMENT;
  const changedCount = changedFieldCount(form, initialForm);
  const navItems = sectionFieldCounts(sections, form);
  const summary = shipmentSummary(form);
  const statusStyle = form.status ? SHIPMENT_STATUS_STYLES[form.status] : undefined;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="md"
      eyebrow={shipmentEyebrow(form, isEdit)}
      title={isEdit && source ? `Shipment ${source.id}` : 'New Shipment'}
      headerChips={
        <>
          <Chip size="small" variant="outlined" label={format?.name ?? ALL_FIELDS_FORMAT_NAME} sx={{ height: 20, fontSize: '0.68rem' }} />
          {form.status && statusStyle && (
            <Chip size="small" label={form.status} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, ...statusStyle }} />
          )}
        </>
      }
      headerEnd={
        <Box sx={{ display: 'flex', gap: 1.5, alignSelf: 'flex-end' }}>
          <Box sx={{ width: 170 }}>
            <FormSelect label="Route" value={form.route} onChange={setField('route')} options={routeOptions} />
          </Box>
          <Box sx={{ width: 150 }}>
            <FormSelect label="Status" value={form.status} onChange={setField('status')} options={SHIPMENT_STATUS_OPTIONS} />
          </Box>
        </Box>
      }
      subheader={
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 2 }}>
          {summary.map((cell) => (
            <Box key={cell.label} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.6, color: 'text.disabled' }}>
                {cell.label.toUpperCase()}
              </Typography>
              <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 600, color: cell.value ? 'text.primary' : 'text.disabled' }}>
                {cell.value || '—'}
              </Typography>
            </Box>
          ))}
        </Box>
      }
      sideNav={
        sections.length > 0 ? (
          <SectionNav items={navItems} activeKey={activeSection?.key ?? ''} onChange={setActiveSectionKey} />
        ) : undefined
      }
      error={error}
      saving={saving}
      changedCount={changedCount}
      lastSavedLabel={
        isEdit && source?.updated_at
          ? `Last saved by ${source.updated_by ?? '—'} · ${timeAgo(source.updated_at)}`
          : undefined
      }
    >
      {activeSection && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.75 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800 }}>{activeSection.label}</Typography>
            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>Tab moves to the next field · Enter saves</Typography>
          </Box>
          <ShipmentSection
            section={activeSection}
            form={form}
            setField={setField}
            setSuppliers={setSuppliers}
            setRows={setRows}
          />
        </>
      )}
    </AppDialog>
  );
};
