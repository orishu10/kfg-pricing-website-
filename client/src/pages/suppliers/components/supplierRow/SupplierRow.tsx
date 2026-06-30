import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Supplier } from '../../../../api';

interface SupplierRowProps {
  supplier: Supplier;
  onOpen: () => void;
}

export const SupplierRow = ({ supplier, onOpen }: SupplierRowProps) => (
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
      <Typography fontWeight={600} noWrap>{supplier.name}</Typography>
      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
        #{supplier.id}
      </Typography>
    </Box>
    <ChevronRightIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
  </Box>
);
