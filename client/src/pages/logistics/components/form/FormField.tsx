import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { DateInput } from '../../../../components/dateInput/DateInput';
import { FieldLabel } from '../../../../components/fieldLabel/FieldLabel';
import { formatNumber } from '../../../../utils/format';
import { INPUT_SX } from './styles';

interface FormFieldProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  unit?: string;
  type?: string;
  required?: boolean;
  auto?: boolean;
  hint?: string;
  error?: boolean;
  autoFocus?: boolean;
  emphasized?: boolean;
}

export const FormField = ({
  label, value, onChange, readOnly, unit, type, required, auto, hint, error, autoFocus, emphasized,
}: FormFieldProps) => {
  const locked = readOnly || auto;
  const fieldSx = {
    ...INPUT_SX,
    bgcolor: locked ? 'rgba(0,0,0,0.05)' : '#fff',
    ...(emphasized ? { '& .MuiInputBase-input': { ...INPUT_SX['& .MuiInputBase-input'], fontWeight: 700 } } : {}),
  };
  const showError = error || (required && !locked && value.trim() === '');

  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel label={label} required={required && !locked} auto={auto} />
      {type === 'date' ? (
        <DateInput
          value={value}
          onChange={onChange}
          readOnly={locked}
          placeholder="Pick a date"
          inputSx={fieldSx}
          error={showError}
          autoFocus={autoFocus}
        />
      ) : (
        <TextField
          value={locked ? formatNumber(value) : value}
          type={type}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          size="small"
          fullWidth
          error={showError}
          autoFocus={autoFocus}
          slotProps={{
            input: {
              readOnly: locked,
              sx: fieldSx,
              endAdornment: unit ? (
                <InputAdornment position="end" sx={{ '& p': { fontSize: '0.75rem' } }}>{unit}</InputAdornment>
              ) : undefined,
            },
          }}
        />
      )}
      {hint && (
        <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.35, lineHeight: 1.3 }}>{hint}</Typography>
      )}
    </Box>
  );
};
