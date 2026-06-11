import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Grid } from '@mui/system';

interface FormSelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}

export const FormSelectField = ({ label, value, onChange, options }: FormSelectFieldProps) => (
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={(e) => onChange(e.target.value)}>
        <MenuItem value="">— select —</MenuItem>
        {options.map((o) => (
          <MenuItem key={o} value={o}>{o}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
);
