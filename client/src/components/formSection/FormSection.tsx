import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface FormSectionProps {
  label: string;
  columns?: 1 | 2;
  children: React.ReactNode;
}

export const FormSection = ({ label, columns = 2, children }: FormSectionProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Typography
        sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.6, color: 'text.disabled', whiteSpace: 'nowrap' }}
      >
        {label.toUpperCase()}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0,0,0,0.1)' }} />
    </Box>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: columns === 2 ? '1fr 1fr' : '1fr' },
        columnGap: 2,
        rowGap: 1.5,
        alignItems: 'start',
      }}
    >
      {children}
    </Box>
  </Box>
);
