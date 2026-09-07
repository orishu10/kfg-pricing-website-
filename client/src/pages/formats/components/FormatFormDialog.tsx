import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import { AppDialog, CommonInput, SectionNav } from '../../../components';
import { SHIPMENT_SECTIONS, type ShipmentSelectableKey } from '../../logistics/weeklyShipments/utils/consts';
import { orderedFields, sectionKeys } from '../utils/helpers';
import { timeAgo } from '../../../utils/time';
import type { ShipmentFormat, ShipmentFormatPayload } from '../../../api';
import { FormatSectionPicker } from './FormatSectionPicker';

interface FormatFormDialogProps {
  open: boolean;
  initial: ShipmentFormat | null;
  error: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: ShipmentFormatPayload) => void;
}

export const FormatFormDialog = ({ open, initial, error, saving, onClose, onSubmit }: FormatFormDialogProps) => {
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

  const initialName = initial?.name ?? '';
  const initialFields = orderedFields((initial?.fields ?? []) as ShipmentSelectableKey[]).join(',');
  const changedCount = (name !== initialName ? 1 : 0) + (orderedFields(fields).join(',') !== initialFields ? 1 : 0);

  const navItems = SHIPMENT_SECTIONS.map((section) => {
    const keys = sectionKeys(section);
    return {
      key: section.key,
      label: section.label,
      total: keys.length,
      filled: keys.filter((key) => fields.includes(key)).length,
    };
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ name: name.trim(), fields: orderedFields(fields) });
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="md"
      title={initial ? `Format ${initial.name}` : 'New Format'}
      subtitle={`${fields.length} field${fields.length === 1 ? '' : 's'} selected`}
      avatar={<ViewQuiltOutlinedIcon />}
      headerEnd={
        <Box sx={{ width: 260, alignSelf: 'center' }}>
          <CommonInput label="Format Name" size="small" required value={name} onChange={setName} />
        </Box>
      }
      sideNav={<SectionNav items={navItems} activeKey={activeSection.key} onChange={setActiveSectionKey} />}
      error={error}
      saving={saving}
      changedCount={changedCount}
      lastSavedLabel={
        initial?.updated_at ? `Last saved by ${initial.updated_by ?? '—'} · ${timeAgo(initial.updated_at)}` : undefined
      }
      submitLabel={initial ? 'Save Format' : 'Create Format'}
      submitDisabled={!name.trim() || fields.length === 0}
    >
      <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, mb: 1.5 }}>{activeSection.label}</Typography>
      <FormatSectionPicker section={activeSection} fields={fields} onChange={setFields} />
    </AppDialog>
  );
};
