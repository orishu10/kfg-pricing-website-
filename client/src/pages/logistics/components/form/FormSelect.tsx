import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { LABEL_SX, INPUT_SX } from './styles';

export type SelectOption = string | { label: string; value: string };

interface FormSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

export const FormSelect = ({ label, value, onChange, options }: FormSelectProps) => (
  <Box sx={{ minWidth: 0 }}>
    {label && <Typography sx={LABEL_SX}>{label}</Typography>}
    <Select value={value} onChange={(e) => onChange(e.target.value)} size="small" fullWidth displayEmpty sx={INPUT_SX}>
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
