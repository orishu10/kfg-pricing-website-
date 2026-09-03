import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import kfgLogo from '../../../public/KFG-Logo.svg';
import { NavCard } from './components/NavCard';
import { HOME_CARDS_GRID_SX, HOME_MODULE_CARDS } from './utils/consts';
import { useAuth } from '../../context/auth';

export const HomePage = () => {
  const navigate = useNavigate();
  const { canAccess } = useAuth();

  const cards = HOME_MODULE_CARDS.filter((card) => canAccess(card.requires));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
      <Box sx={HOME_CARDS_GRID_SX}>
        {cards.map((card) => (
          <NavCard
            key={card.path}
            icon={card.icon}
            label={card.label}
            onClick={() => card.ready && navigate(card.path)}
          />
        ))}
      </Box>

      {cards.length === 0 && (
        <Box sx={{ flexShrink: 0, textAlign: 'center', pt: 6, pb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            No modules assigned
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask an administrator to grant you access.
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          pb: 4,
          minHeight: 0,
        }}
      >
        <Box
          component="img"
          src={kfgLogo}
          alt="KFG"
          sx={{ maxWidth: 780, width: '90%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>
    </Box>
  );
};

export default HomePage;
