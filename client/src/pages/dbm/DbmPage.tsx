import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PublicIcon from '@mui/icons-material/Public';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import AnchorIcon from '@mui/icons-material/Anchor';
import { NavCard } from '../home/components/NavCard';

const iconSx = { fontSize: 56 } as const;

export const DbmPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, max-content)', md: 'repeat(3, max-content)' },
        justifyContent: 'center',
        gap: { xs: 3, sm: 5 },
        pt: 4,
        pb: 4,
      }}
    >
      <NavCard icon={<PeopleAltIcon sx={iconSx} />} label="Customers" onClick={() => navigate('/customers')} />
      <NavCard icon={<LocalShippingIcon sx={iconSx} />} label="Suppliers" onClick={() => navigate('/suppliers')} />
      <NavCard icon={<Inventory2Icon sx={iconSx} />} label="Items" onClick={() => navigate('/items')} />
      <NavCard icon={<SwapHorizIcon sx={iconSx} />} label="Incoterms" onClick={() => {}} />
      <NavCard icon={<CurrencyExchangeIcon sx={iconSx} />} label="Currencies" onClick={() => {}} />
      <NavCard icon={<PublicIcon sx={iconSx} />} label="Countries" onClick={() => {}} />
      <NavCard icon={<ViewInArIcon sx={iconSx} />} label="Containers" onClick={() => {}} />
      <NavCard icon={<DirectionsBoatIcon sx={iconSx} />} label="Shipping Lines" onClick={() => {}} />
      <NavCard icon={<AnchorIcon sx={iconSx} />} label="Sea Ports" onClick={() => {}} />
    </Box>
  );
};

export default DbmPage;
