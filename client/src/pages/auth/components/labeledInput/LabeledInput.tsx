import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PasswordVisibilityToggle } from '../../../../components';
import { inputSx } from '../../utils/consts';

interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}

export const LabeledInput = ({ label, value, onChange, type, autoFocus, autoComplete }: LabeledInputProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <Box>
      <Typography sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.95rem', mb: 0.5 }}>
        {label}
      </Typography>
      <TextField
        type={isPassword && passwordVisible ? 'text' : type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        sx={inputSx}
        slotProps={
          isPassword
            ? {
                input: {
                  endAdornment: (
                    <PasswordVisibilityToggle
                      visible={passwordVisible}
                      onToggle={() => setPasswordVisible((previous) => !previous)}
                    />
                  ),
                },
              }
            : undefined
        }
      />
    </Box>
  );
};
