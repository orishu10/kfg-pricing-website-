import TextField from '@mui/material/TextField';
import { Grid } from '@mui/system';

interface IntFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  col?: boolean;
}

export const IntField = ({ label, value, onChange, col }: IntFieldProps) => (
  <Grid size={col ? { xs: 12 } : { xs: 12, sm: 6, md: 3 }}>
    <TextField
      label={label}
      fullWidth
      slotProps={{ htmlInput: { step: '1', min: '0' } }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
    />
  </Grid>
);
