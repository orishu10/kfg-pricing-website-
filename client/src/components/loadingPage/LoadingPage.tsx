import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingPageProps {
  message?: string;
  /** 'page' fills the viewport; 'section' fills its container */
  variant?: 'page' | 'section';
}

export const LoadingPage = ({ message, variant = 'page' }: LoadingPageProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      ...(variant === 'page'
        ? { minHeight: '60vh' }
        : { py: 8 }),
    }}
  >
    <CircularProgress color="primary" />
    {message && (
      <Typography color="text.secondary" variant="body2">
        {message}
      </Typography>
    )}
  </Box>
);
