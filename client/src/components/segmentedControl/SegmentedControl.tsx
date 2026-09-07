import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

interface SegmentOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | SegmentOption[];
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  fullWidth?: boolean;
}

const toOptions = (options: string[] | SegmentOption[]): SegmentOption[] =>
  options.map((option) => (typeof option === 'string' ? { label: option, value: option } : option));

export const SegmentedControl = ({
  value,
  onChange,
  options,
  label,
  size = 'small',
  disabled,
  fullWidth = true,
}: SegmentedControlProps) => (
  <Box sx={{ minWidth: 0, width: fullWidth ? '100%' : 'auto' }}>
    {label && (
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#3a3a3a', mb: 0.35 }}>{label}</Typography>
    )}
    <Box
      role="radiogroup"
      aria-label={label}
      sx={{
        display: 'flex',
        border: '1px solid rgba(0,0,0,0.23)',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: '#fff',
        height: 40,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {toOptions(options).map((option) => {
        const selected = option.value === value;
        return (
          <ButtonBase
            key={option.value}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            sx={{
              flex: 1,
              fontSize: size === 'small' ? '0.78rem' : '0.85rem',
              fontWeight: 700,
              color: selected ? '#fff' : 'text.secondary',
              bgcolor: selected ? 'primary.main' : 'transparent',
              transition: 'background-color 120ms ease, color 120ms ease',
              '&:hover': { bgcolor: selected ? 'primary.dark' : 'rgba(0,0,0,0.04)' },
            }}
          >
            {option.label}
          </ButtonBase>
        );
      })}
    </Box>
  </Box>
);
