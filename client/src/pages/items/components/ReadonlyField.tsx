import TextField from '@mui/material/TextField';
import { Grid } from '@mui/system';

interface ReadonlyFieldProps {
  label: string;
  value: string;
  col?: boolean;
}

export const ReadonlyField = ({ label, value, col }: ReadonlyFieldProps) => (
  <Grid size={col ? { xs: 12 } : { xs: 12, sm: 6, md: 3 }}>
    <TextField
      label={label}
      fullWidth
      value={value}
      disabled
      sx={{ '& .MuiInputBase-input': { color: 'text.secondary', fontFamily: 'monospace' } }}
    />
  </Grid>
);
