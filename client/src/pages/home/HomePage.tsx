import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { NavCard } from './components/navCard/NavCard';
import { useAuth } from '../../context/AuthContext';
import kfgLogo from '../../../public/KFG-Logo.svg';
import kfgBackground from '../../../public/background-logo.webp';

export const HomePage = () => {
  const navigate = useNavigate();
  const { logout, username } = useAuth();

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundImage: `url(${kfgBackground})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      {/* Sign-out button — top right */}
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          right: 18,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
        }}
      >
        {username && (
          <Typography sx={{ color: '#444', fontSize: '0.85rem', fontWeight: 500 }}>
            {username}
          </Typography>
        )}
        <Button
          size="small"
          onClick={logout}
          sx={{
            color: '#444',
            borderColor: 'rgba(0,0,0,0.25)',
            border: '1px solid',
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.8rem',
            px: 1.5,
            py: 0.4,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' },
          }}
        >
          Sign Out
        </Button>
      </Box>

      {/* Navigation cards */}
      <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', gap: 4, pt: 6, pb: 2 }}>
        <NavCard
          icon={<SettingsSuggestIcon sx={{ color: '#fff', fontSize: 58 }} />}
          label="PMS"
          onClick={() => {
            /* PMS route TBD */
          }}
        />
        <NavCard
          icon={<MonetizationOnIcon sx={{ color: '#fff', fontSize: 58 }} />}
          label="PRICING"
          onClick={() => navigate('/customers')}
        />
      </Box>

      {/* KFG logo */}
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
