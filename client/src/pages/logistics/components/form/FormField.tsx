import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { LABEL_SX, INPUT_SX } from './styles';

interface FormFieldProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  unit?: string;
  type?: string;
}

export const FormField = ({ label, value, onChange, readOnly, unit, type }: FormFieldProps) => (
  <Box sx={{ minWidth: 0 }}>
    {label && <Typography sx={LABEL_SX}>{label}</Typography>}
    <TextField
      value={value}
      type={type}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      size="small"
      fullWidth
      slotProps={{
        input: {
          readOnly,
          sx: { ...INPUT_SX, bgcolor: readOnly ? 'rgba(0,0,0,0.05)' : '#fff' },
          endAdornment: unit ? (
            <InputAdornment position="end" sx={{ '& p': { fontSize: '0.75rem' } }}>{unit}</InputAdornment>
          ) : undefined,
        },
      }}
    />
  </Box>
);
