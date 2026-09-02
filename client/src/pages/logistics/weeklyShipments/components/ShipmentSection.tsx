import Box from '@mui/material/Box';
import type { ShipmentFieldKey, ShipmentForm, ShipmentRowKey, ShipmentSectionSpec } from '../utils/consts';
import type { ShipmentDocumentRow } from '../../../../api';
import { fieldGridColumn } from '../utils/helpers';
import { ShipmentFieldControl } from './ShipmentFieldControl';

interface ShipmentSectionProps {
  section: ShipmentSectionSpec;
  form: ShipmentForm;
  setField: (key: ShipmentFieldKey) => (value: string) => void;
  setSuppliers: (suppliers: string[]) => void;
  setRows: (key: ShipmentRowKey, rows: ShipmentDocumentRow[]) => void;
}

export const ShipmentSection = ({ section, form, setField, setSuppliers, setRows }: ShipmentSectionProps) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, alignItems: 'start' }}>
    {section.fields.map((spec) => (
      <Box key={spec.key} sx={{ minWidth: 0, gridColumn: fieldGridColumn(spec) }}>
        <ShipmentFieldControl
          spec={spec}
          form={form}
          setField={setField}
          setSuppliers={setSuppliers}
          setRows={setRows}
        />
      </Box>
    ))}
  </Box>
);
