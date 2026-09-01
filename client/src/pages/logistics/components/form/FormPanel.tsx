import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface FormPanelProps {
  label?: string;
  color?: string;
  children: React.ReactNode;
}

export const FormPanel = ({ label, color, children }: FormPanelProps) => (
  <Box
    sx={{
      position: 'relative',
      bgcolor: color ?? '#fff',
      border: '1px solid rgba(0,0,0,0.18)',
      borderRadius: 1.5,
      pt: label ? 2.4 : 1.5,
      px: 1.5,
      pb: 1.5,
    }}
  >
    {label && (
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          bgcolor: '#efefef',
          border: '1px solid rgba(0,0,0,0.18)',
          borderRadius: 5,
          px: 1.2,
          py: 0.15,
        }}
      >
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.6, color: '#555', whiteSpace: 'nowrap' }}>
          {label}
        </Typography>
      </Box>
    )}
    {children}
  </Box>
);
