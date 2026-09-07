import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface FieldLabelProps {
  label?: string;
  required?: boolean;
  auto?: boolean;
}

export const FieldLabel = ({ label, required, auto }: FieldLabelProps) => {
  if (!label) return null;
  return (
    <Typography
      component="div"
      sx={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#3a3a3a',
        mb: 0.35,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        lineHeight: 1.4,
      }}
    >
      {label}
      {required && (
        <Box component="span" sx={{ color: 'error.main' }}>
          *
        </Box>
      )}
      {auto && (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: 0.5,
            color: 'text.disabled',
            textTransform: 'uppercase',
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: '0.65rem' }} />
          auto
        </Box>
      )}
    </Typography>
  );
};
