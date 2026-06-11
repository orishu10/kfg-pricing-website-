import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Grid } from '@mui/system';

interface FormTextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  currency?: boolean;
  col?: boolean;
}

export const FormTextField = ({ label, value, onChange, required, currency, col }: FormTextFieldProps) => (
  <Grid size={col ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }}>
    <TextField
      label={label}
      fullWidth
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={currency && value ? {
        input: { endAdornment: <InputAdornment position="end">$</InputAdornment> },
      } : undefined}
    />
  </Grid>
);
