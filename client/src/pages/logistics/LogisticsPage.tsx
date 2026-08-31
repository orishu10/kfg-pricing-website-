import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShieldIcon from '@mui/icons-material/Shield';
import { NavCard } from '../home/components/NavCard';

const iconSx = { fontSize: 56 } as const;

export const LogisticsPage = () => {
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
      <NavCard icon={<LocalShippingIcon sx={iconSx} />} label="Weekly Shipments" onClick={() => navigate('/logistics/weekly-shipments')} />
      <NavCard icon={<EventNoteIcon sx={iconSx} />} label="Schedules" onClick={() => navigate('/logistics/schedules')} />
      <NavCard icon={<AltRouteIcon sx={iconSx} />} label="Routes" onClick={() => navigate('/logistics/routes')} />
      <NavCard icon={<HistoryIcon sx={iconSx} />} label="Shipment History" onClick={() => {}} />
      <NavCard icon={<ReceiptLongIcon sx={iconSx} />} label="Weekly Expenses" onClick={() => {}} />
      <NavCard icon={<ShieldIcon sx={iconSx} />} label="Insurance" onClick={() => {}} />
    </Box>
  );
};

export default LogisticsPage;
