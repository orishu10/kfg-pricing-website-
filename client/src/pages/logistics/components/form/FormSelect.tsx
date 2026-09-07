import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FieldLabel } from '../../../../components/fieldLabel/FieldLabel';
import { INPUT_SX } from './styles';

export type SelectOption = string | { label: string; value: string };

interface FormSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
}

export const FormSelect = ({ label, value, onChange, options, required, disabled }: FormSelectProps) => (
  <Box sx={{ minWidth: 0 }}>
    <FieldLabel label={label} required={required} />
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      displayEmpty
      disabled={disabled}
      error={required && value === ''}
      sx={INPUT_SX}
    >
      <MenuItem value=""><em>—</em></MenuItem>
      {options.map((op) =>
        typeof op === 'string' ? (
          <MenuItem key={op} value={op}>{op}</MenuItem>
        ) : (
          <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
        ),
      )}
    </Select>
  </Box>
);
