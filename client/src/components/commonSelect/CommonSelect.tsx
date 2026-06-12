import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

interface SelectOption {
  label: string;
  value: string;
}

interface CommonSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[] | SelectOption[];
  required?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string | null;
}

const toOptions = (opts: string[] | SelectOption[]): SelectOption[] =>
  opts.map((o) => (typeof o === 'string' ? { label: o, value: o } : o));

export const CommonSelect = ({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
  size = 'medium',
  fullWidth = true,
  error,
  helperText,
  placeholder = '— select —',
}: CommonSelectProps) => (
  <FormControl fullWidth={fullWidth} size={size} required={required} disabled={disabled} error={error}>
    <InputLabel>{label}</InputLabel>
    <Select value={value} label={label} onChange={(e) => onChange(e.target.value)}>
      {placeholder !== null && (
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
      )}
      {toOptions(options).map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </Select>
    {helperText && <FormHelperText>{helperText}</FormHelperText>}
  </FormControl>
);
