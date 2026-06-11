import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { Supplier } from '../../../../api';

interface SupplierCardProps {
  supplier: Supplier;
  onOpen: () => void;
}

export const SupplierCard = ({ supplier, onOpen }: SupplierCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardActionArea onClick={onOpen} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>{supplier.name}</Typography>
        <Typography variant="caption" color="text.secondary">#{supplier.id}</Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);
