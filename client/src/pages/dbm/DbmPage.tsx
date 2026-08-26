import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { NavCard } from '../home/components/NavCard';

const iconSx = { fontSize: 56 } as const;

export const DbmPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 4, sm: 8 }, flexWrap: 'wrap', pt: 4 }}>
      <NavCard icon={<PeopleAltIcon sx={iconSx} />} label="Customers" onClick={() => navigate('/customers')} />
      <NavCard icon={<LocalShippingIcon sx={iconSx} />} label="Suppliers" onClick={() => navigate('/suppliers')} />
      <NavCard icon={<Inventory2Icon sx={iconSx} />} label="Items" onClick={() => navigate('/items')} />
    </Box>
  );
};

export default DbmPage;
