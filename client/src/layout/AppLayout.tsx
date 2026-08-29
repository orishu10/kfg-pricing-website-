import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
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

const NAV = [
  { label: 'Customers', path: '/customers' },
  { label: 'Suppliers', path: '/suppliers' },
  { label: 'Items', path: '/items' },
  { label: 'Pricing', path: '/pricing' },
] as const;

export const AppLayout = () => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [navAnchorEl, setNavAnchorEl] = useState<null | HTMLElement>(null);

  // Highlight the tab whose route matches the current path (including sub-routes
  // like /pricing/new). Falls back to `false` on hub pages (/, /dbm) so no tab
  // shows as selected.
  const activeTab =
    NAV.find((n) => pathname === n.path || pathname.startsWith(`${n.path}/`))?.path ?? false;

  const go = (path: string) => {
    setNavAnchorEl(null);
    navigate(path);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', ...bgStyle }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <Box
              component="img"
              src={kfgLogo}
              alt="KFG"
              onClick={() => navigate('/')}
              sx={{ height: 40, cursor: 'pointer' }}
            />

            {/* Desktop nav tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => navigate(v)}
              textColor="inherit"
              sx={{ display: { xs: 'none', md: 'flex' }, minHeight: 48, '& .MuiTab-root': { color: '#494445' } }}
            >
              {NAV.map((n) => (
                <Tab key={n.path} label={n.label} value={n.path} sx={{ textTransform: 'none', fontWeight: 600 }} />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Mobile nav menu */}
            <Tooltip title="Menu">
              <IconButton
                onClick={(e) => setNavAnchorEl(e.currentTarget)}
                sx={{ color: '#494445', display: { xs: 'inline-flex', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={navAnchorEl}
              open={Boolean(navAnchorEl)}
              onClose={() => setNavAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              slotProps={{ paper: { sx: { minWidth: 180, mt: 1 } } }}
            >
              {NAV.map((n) => (
                <MenuItem key={n.path} selected={activeTab === n.path} onClick={() => go(n.path)}>
                  {n.label}
                </MenuItem>
              ))}
            </Menu>

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
