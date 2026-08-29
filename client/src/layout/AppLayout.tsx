import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';
import kfgBackground from '../../public/background-logo.webp';
import kfgLogo from '../../public/KFG-Logo.svg';

const bgStyle = {
  bgcolor: 'background.default',
  backgroundImage: `url(${kfgBackground})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
} as const;

export const AppLayout = () => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', ...bgStyle }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            component="img"
            src={kfgLogo}
            alt="KFG"
            onClick={() => navigate('/')}
            sx={{ height: 40, cursor: 'pointer' }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Home">
              <IconButton onClick={() => navigate('/')} sx={{ color: '#494445' }}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#494445' }}>
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { minWidth: 200, mt: 1 } } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Signed in as
                </Typography>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {username}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ px: 1, py: 1 }}>
                <Button
                  fullWidth
                  startIcon={<LogoutIcon />}
                  onClick={() => {
                    setAnchorEl(null);
                    logout();
                  }}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.primary' }}
                >
                  Sign out
                </Button>
              </Box>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          p: { xs: 2, sm: 3 },
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
