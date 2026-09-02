import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { FormField, FormSelect } from '../../components/form';
import { useLookups } from '../../../../hooks/useLookups';
import { useShipmentFormOptions } from '../hooks/useShipmentFormOptions';
import { appendValue, removeValue, scheduleSummary, updateValue } from '../utils/helpers';
import {
  CHARGE_PAYER_OPTIONS,
  type ShipmentFieldKey, type ShipmentFieldSpec, type ShipmentForm, type ShipmentRowKey,
} from '../utils/consts';
import type { ShipmentDocumentRow } from '../../../../api';
import { DocumentRowGroup } from './DocumentRowGroup';
import { AddRowButton, RemoveRowButton } from './RowActions';

interface ShipmentFieldControlProps {
  spec: ShipmentFieldSpec;
  form: ShipmentForm;
  setField: (key: ShipmentFieldKey) => (value: string) => void;
  setSuppliers: (suppliers: string[]) => void;
  setRows: (key: ShipmentRowKey, rows: ShipmentDocumentRow[]) => void;
}

export const ShipmentFieldControl = ({
  spec, form, setField, setSuppliers, setRows,
}: ShipmentFieldControlProps) => {
  const { options } = useLookups();
  const { customerOptions, scheduleOptions, supplierOptions, findSchedule } = useShipmentFormOptions();

  if (spec.control === 'supplierList') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {form.suppliers.map((supplier, index) => (
          <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.5 }}>
            <FormSelect
              label={index === 0 ? spec.label : undefined}
              value={supplier}
              onChange={(value) => setSuppliers(updateValue(form.suppliers, index, value))}
              options={supplierOptions(supplier)}
            />
            <RemoveRowButton
              label="Remove supplier"
              onClick={() => setSuppliers(removeValue(form.suppliers, index))}
            />
          </Box>
        ))}
        <AddRowButton label="Add Supplier" onClick={() => setSuppliers(appendValue(form.suppliers))} />
      </Box>
    );
  }

  if (spec.control === 'documentRows') {
    return (
      <DocumentRowGroup
        addLabel={spec.addLabel ?? `Add ${spec.label}`}
        rows={form[spec.key as ShipmentRowKey]}
        columns={spec.columns ?? []}
        onChange={(rows) => setRows(spec.key as ShipmentRowKey, rows)}
      />
    );
  }

  const key = spec.key as ShipmentFieldKey;
  const value = form[key];

  if (spec.control === 'checkbox') {
    return (
      <FormControlLabel
        sx={{ alignSelf: 'end' }}
        control={
          <Checkbox
            checked={value === 'true'}
            onChange={(event) => setField(key)(event.target.checked ? 'true' : '')}
          />
        }
        label={spec.label}
      />
    );
  }

  if (spec.control === 'schedule') {
    const summary = scheduleSummary(findSchedule(value));
    const pickSchedule = (scheduleId: string) => {
      setField(key)(scheduleId);
      const schedule = findSchedule(scheduleId);
      if (!schedule) return;
      setField('vessel')(schedule.vessel ?? '');
      setField('voyage')(schedule.voyage ?? '');
    };

    return (
      <Box>
        <FormSelect label={spec.label} value={value} onChange={pickSchedule} options={scheduleOptions} />
        {summary.map((line) => (
          <Typography key={line} sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>
            {line}
          </Typography>
        ))}
      </Box>
    );
  }

  if (spec.control === 'lookup') {
    return (
      <FormSelect
        label={spec.label}
        value={value}
        onChange={setField(key)}
        options={options(spec.lookup!, value)}
      />
    );
  }

  if (spec.control === 'customer') {
    return (
      <FormSelect
        label={spec.label}
        value={value}
        onChange={setField(key)}
        options={customerOptions(value)}
      />
    );
  }

  if (spec.control === 'payer') {
    return (
      <FormSelect
        label={spec.label}
        value={value}
        onChange={setField(key)}
        options={CHARGE_PAYER_OPTIONS}
      />
    );
  }

  return (
    <FormField
      label={spec.label}
      type={spec.control === 'date' ? 'date' : undefined}
      unit={spec.unit}
      value={value}
      onChange={setField(key)}
    />
  );
};
