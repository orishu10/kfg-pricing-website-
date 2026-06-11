import { Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAuth } from '../context/AuthContext';
import kfgBackground from '../../public/background-logo.svg';

const bgStyle = {
  bgcolor: '#c8c8c8',
  backgroundImage: `url(${kfgBackground})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
} as const;

export const AppLayout = () => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', ...bgStyle }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#424143' }}>
        <Toolbar>
          <Typography
            onClick={() => navigate('/')}
            variant="h6"
            fontWeight={700}
            sx={{ color: '#fff', letterSpacing: '-0.3px', flexGrow: 1, cursor: 'pointer' }}
          >
            KFG Pricing
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mr: 2, fontSize: '0.85rem' }}>
            {username}
          </Typography>
          <Button
            size="small"
            onClick={logout}
            sx={{
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.8rem',
              px: 1.5,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, maxWidth: 1200, width: '100%', mx: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
