import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  actionActive?: boolean;
  onAction?: () => void;
  /** Rendered left of the title, typically a back-navigation button */
  backButton?: React.ReactNode;
}

export const PageHeader = ({ title, actionLabel, actionActive, onAction, backButton }: PageHeaderProps) => (
  <Box>
    {backButton && <Box sx={{ mb: 1 }}>{backButton}</Box>}
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ color: '#222' }}>
        {title}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionActive ? 'Cancel' : actionLabel}
        </Button>
      )}
    </Box>
  </Box>
);
