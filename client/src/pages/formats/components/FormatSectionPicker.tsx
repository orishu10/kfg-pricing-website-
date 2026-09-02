import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ShipmentFieldControl } from '../../logistics/weeklyShipments/components/ShipmentFieldControl';
import { EMPTY_SHIPMENT, type ShipmentSectionSpec, type ShipmentSelectableKey } from '../../logistics/weeklyShipments/utils/consts';
import { fieldGridColumn } from '../../logistics/weeklyShipments/utils/helpers';
import { sectionSelection, toggleField, toggleSection } from '../utils/helpers';

const previewSetField = () => () => {};
const previewSetSuppliers = () => {};
const previewSetRows = () => {};

interface FormatSectionPickerProps {
  section: ShipmentSectionSpec;
  fields: ShipmentSelectableKey[];
  onChange: (fields: ShipmentSelectableKey[]) => void;
}

export const FormatSectionPicker = ({ section, fields, onChange }: FormatSectionPickerProps) => {
  const selection = sectionSelection(fields, section);

  return (
    <Box>
      <FormControlLabel
        sx={{ mb: 1 }}
        control={
          <Checkbox
            checked={selection === 'all'}
            indeterminate={selection === 'some'}
            onChange={() => onChange(toggleSection(fields, section))}
          />
        }
        label={`Select the whole ${section.label} section`}
        slotProps={{ typography: { fontSize: '0.8rem', fontWeight: 700 } }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, alignItems: 'start' }}>
        {section.fields.map((spec) => (
          <Box
            key={spec.key}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 0.5,
              alignItems: 'center',
              minWidth: 0,
              gridColumn: fieldGridColumn(spec),
            }}
          >
            <Checkbox
              checked={fields.includes(spec.key)}
              onChange={() => onChange(toggleField(fields, spec.key))}
              inputProps={{ 'aria-label': spec.label }}
            />
            <Box sx={{ minWidth: 0, pointerEvents: 'none', opacity: fields.includes(spec.key) ? 1 : 0.5 }}>
              <ShipmentFieldControl
                spec={spec}
                form={EMPTY_SHIPMENT}
                setField={previewSetField}
                setSuppliers={previewSetSuppliers}
                setRows={previewSetRows}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
