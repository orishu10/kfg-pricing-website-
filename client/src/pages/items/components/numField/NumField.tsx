import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { Grid } from '@mui/system';

interface NumFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  calc?: boolean;
  col?: boolean;
}

export const NumField = ({ label, value, onChange, calc, col }: NumFieldProps) => (
  <Grid size={col ? { xs: 12 } : { xs: 12, sm: 6, md: 3 }}>
    <TextField
      label={label}
      fullWidth
      type="number"
      slotProps={{
        htmlInput: { step: '0.0001' },
        ...(calc ? {
          input: {
            endAdornment: (
              <Chip
                label="auto"
                size="small"
                sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(111,66,193,0.25)', color: '#b39ddb', ml: 0.5 }}
              />
            ),
          },
        } : {}),
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="—"
      sx={calc ? {
        '& .MuiOutlinedInput-root': {
          bgcolor: 'rgba(111,66,193,0.08)',
          '& fieldset': { borderColor: 'rgba(111,66,193,0.4)' },
        },
        '& .MuiInputLabel-root': { color: '#9b74d9' },
      } : undefined}
    />
  </Grid>
);
