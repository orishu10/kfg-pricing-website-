import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';

interface EmptyStateProps {
  message: string;
  Icon?: SvgIconComponent;
  action?: React.ReactNode;
}

export const EmptyState = ({ message, Icon, action }: EmptyStateProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      py: 8,
      color: 'text.secondary',
    }}
  >
    {Icon && <Icon sx={{ fontSize: 48, opacity: 0.4 }} />}
    <Typography variant="body1" color="text.secondary" textAlign="center">
      {message}
    </Typography>
    {action}
  </Box>
);
