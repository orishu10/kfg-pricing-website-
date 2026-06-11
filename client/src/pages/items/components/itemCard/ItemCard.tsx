import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { Item } from '../../../../api';

interface ItemCardProps {
  item: Item;
  onOpen: () => void;
}

export const ItemCard = ({ item, onOpen }: ItemCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardActionArea onClick={onOpen} sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>{item.name}</Typography>
        <Typography variant="caption" color="text.secondary" fontFamily="monospace">{item.id}</Typography>
        {item.total != null && (
          <Typography variant="body2" color="success.main" fontWeight={600} mt={1}>
            ${parseFloat(item.total).toFixed(2)}
          </Typography>
        )}
      </CardContent>
    </CardActionArea>
  </Card>
);
