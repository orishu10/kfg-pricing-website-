import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Customer } from '../../../../api';

interface CustomerRowProps {
  customer: Customer;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const CustomerRow = ({ customer, onOpen, onDelete }: CustomerRowProps) => (
  <Box
    onClick={onOpen}
    sx={{
      display: 'flex',
      alignItems: 'center',
      bgcolor: 'background.paper',
      border: '1px solid rgba(0,0,0,0.08)',
      borderLeft: '4px solid',
      borderLeftColor: 'primary.main',
      borderRadius: 1,
      px: 2,
      py: 1.5,
      cursor: 'pointer',
      transition: 'box-shadow 0.15s',
      '&:hover': { boxShadow: '0 2px 10px rgba(0,0,0,0.12)' },
    }}
  >
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography fontWeight={600} noWrap>{customer.name}</Typography>
      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
        {customer.id}
      </Typography>
    </Box>

    <Button
      size="small"
      color="error"
      onClick={onDelete}
      sx={{ mr: 1, fontSize: '0.75rem', flexShrink: 0 }}
    >
      Delete
    </Button>
    <ChevronRightIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
  </Box>
);
