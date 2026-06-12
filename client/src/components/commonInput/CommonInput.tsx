import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

interface CommonInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  /** Appends a $ end-adornment when value is non-empty */
  currency?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
}

export const CommonInput = ({
  label,
  value,
  onChange,
  type,
  required,
  placeholder,
  autoFocus,
  autoComplete,
  currency,
  disabled,
  size = 'medium',
  fullWidth = true,
  error,
  helperText,
}: CommonInputProps) => (
  <TextField
    label={label}
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    required={required}
    placeholder={placeholder}
    autoFocus={autoFocus}
    autoComplete={autoComplete}
    disabled={disabled}
    size={size}
    fullWidth={fullWidth}
    error={error}
    helperText={helperText}
    slotProps={
      currency && value
        ? { input: { endAdornment: <InputAdornment position="end">$</InputAdornment> } }
        : undefined
    }
  />
);
