import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/system';

interface IdentityFieldProps {
  label: string;
  value: string;
}

export const IdentityField = ({ label, value }: IdentityFieldProps) => (
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      display="block"
      fontWeight={600}
      textTransform="uppercase"
      letterSpacing={0.5}
    >
      {label}
    </Typography>
    <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 1.5, py: 1, mt: 0.5 }}>
      <Typography variant="body2" fontFamily="monospace">{value || '—'}</Typography>
    </Box>
  </Grid>
);
