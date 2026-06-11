import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { Customer } from '../../../../api';

interface CustomerCardProps {
  customer: Customer;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const CustomerCard = ({ customer, onOpen, onDelete }: CustomerCardProps) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.15s, border-color 0.15s',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
        borderColor: '#c41230',
      },
    }}
  >
    <CardActionArea onClick={onOpen} sx={{ flexGrow: 1 }}>
      <CardContent>
        <Box sx={{ width: 36, height: 4, bgcolor: '#c41230', borderRadius: 1, mb: 1.5 }} />
        <Typography variant="subtitle1" fontWeight={700} color="#111">
          {customer.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#888', fontFamily: 'monospace' }}>
          {customer.id}
        </Typography>
      </CardContent>
    </CardActionArea>
    <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1, px: 1 }}>
      <Button size="small" color="error" onClick={onDelete} sx={{ fontSize: '0.75rem' }}>
        Delete
      </Button>
    </CardActions>
  </Card>
);
