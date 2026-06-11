import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { inputSx } from '../../utils/consts';

interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}

export const LabeledInput = ({ label, value, onChange, type, autoFocus, autoComplete }: LabeledInputProps) => (
  <Box>
    <Typography sx={{ color: '#111', fontWeight: 500, fontSize: '0.95rem', mb: 0.5 }}>
      {label}
    </Typography>
    <TextField
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      sx={inputSx}
    />
  </Box>
);
