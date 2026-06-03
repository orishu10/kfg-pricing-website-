import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useAuth } from '../../context/AuthContext';
import kfgLogo from '../../assets/KFG Logo.svg';

const STRIPE =
  'repeating-linear-gradient(135deg, transparent 0px, transparent 22px, rgba(255,255,255,0.2) 22px, rgba(255,255,255,0.2) 44px)';

interface NavCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function NavCard({ icon, label, onClick }: NavCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 155,
        height: 155,
        bgcolor: '#424143',
        border: '2.5px solid #c41230',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        },
        '&:active': { transform: 'translateY(0)' },
      }}
    >
      {icon}
      <Typography
        sx={{
          color: '#fff',
          fontWeight: 800,
          fontSize: '1.05rem',
          letterSpacing: 1.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function HomePage() {
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
        bgcolor: '#c8c8c8',
        backgroundImage: STRIPE,
      }}
    >
      {/* Sign-out button — top right */}
      <Box sx={{ position: 'absolute', top: 14, right: 18, zIndex: 10, display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            px: 1.5, py: 0.4,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' },
          }}
        >
          Sign Out
        </Button>
      </Box>

      {/* Navigation cards */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          pt: 6,
          pb: 2,
        }}
      >
        <NavCard
          icon={<SettingsSuggestIcon sx={{ color: '#fff', fontSize: 58 }} />}
          label="PMS"
          onClick={() => {/* PMS route TBD */}}
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
}
