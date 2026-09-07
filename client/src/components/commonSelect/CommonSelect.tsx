import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

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
  searchable?: boolean;
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
  searchable = false,
}: CommonSelectProps) => {
  const normalized = toOptions(options);

  if (searchable) {
    const selected = normalized.find((option) => option.value === value) ?? null;
    return (
      <Autocomplete
        options={normalized}
        value={selected}
        onChange={(_event, option) => onChange(option?.value ?? '')}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, current) => option.value === current.value}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={error}
            helperText={helperText}
            placeholder="Type to search…"
          />
        )}
      />
    );
  }

  return (
    <FormControl fullWidth={fullWidth} size={size} required={required} disabled={disabled} error={error}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={(e) => onChange(e.target.value)}>
        {placeholder !== null && (
          <MenuItem value="">
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {normalized.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
