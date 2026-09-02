import { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { DateInput } from '../dateInput/DateInput';
import { PasswordVisibilityToggle } from '../passwordVisibilityToggle/PasswordVisibilityToggle';

interface CommonInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
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
}: CommonInputProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === 'password';

  if (type === 'date') {
    return (
      <DateInput
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        error={error}
        helperText={helperText}
      />
    );
  }

  const endAdornment = isPassword ? (
    <PasswordVisibilityToggle
      visible={passwordVisible}
      onToggle={() => setPasswordVisible((previous) => !previous)}
    />
  ) : currency && value ? (
    <InputAdornment position="end">$</InputAdornment>
  ) : undefined;

  return (
    <TextField
      label={label}
      type={isPassword && passwordVisible ? 'text' : type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      slotProps={endAdornment ? { input: { endAdornment } } : undefined}
    />
  );
};
