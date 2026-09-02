import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useAuth } from '../context/auth';
import { getRoutes } from '../api';
import { expiringSoon, isUrgent, expiryLabel } from '../pages/logistics/routes/utils/helpers';
import kfgBackground from '../../public/background-logo.webp';
import kfgLogo from '../../public/KFG-Logo.svg';

const bgStyle = {
  bgcolor: 'background.default',
  backgroundImage: `url(${kfgBackground})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
} as const;

interface NavItem {
  label: string;
  path: string;
  /** false ⇒ page not built yet: shown disabled ("coming soon") */
  ready?: boolean;
}

interface NavModule extends NavItem {
  children: NavItem[];
}

// Two-level navigation mirroring the KFG design: top-level modules, each with
// its own set of sub-sections. `ready: false` entries render disabled until
// their page exists — flip the flag (and add the route) as pages get built.
const MODULES: NavModule[] = [
  {
    label: 'DBM',
    path: '/dbm',
    ready: true,
    children: [
      { label: 'Customers', path: '/customers', ready: true },
      { label: 'Suppliers', path: '/suppliers', ready: true },
      { label: 'Items', path: '/items', ready: true },
      { label: 'Incoterms', path: '/incoterms', ready: true },
      { label: 'Currencies', path: '/currencies', ready: true },
      { label: 'Countries', path: '/countries', ready: true },
      { label: 'Containers', path: '/containers', ready: true },
      { label: 'Shipping Lines', path: '/shipping-lines', ready: true },
      { label: 'Sea Ports', path: '/sea-ports', ready: true },
    ],
  },
  { label: 'Pricing', path: '/pricing', ready: true, children: [] },
  {
    label: 'Logistics',
    path: '/logistics',
    ready: true,
    children: [
      { label: 'Weekly Shipments', path: '/logistics/weekly-shipments', ready: true },
      { label: 'Schedules', path: '/logistics/schedules', ready: true },
      { label: 'Routes', path: '/logistics/routes', ready: true },
      { label: 'Shipment History', path: '/logistics/shipment-history' },
      { label: 'Weekly Expenses', path: '/logistics/weekly-expenses' },
      { label: 'Insurance', path: '/logistics/insurance' },
    ],
  },
  { label: 'Reports', path: '/reports', children: [] },
];

export const AppLayout = () => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [navAnchorEl, setNavAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: getRoutes });
  const expiring = expiringSoon(routes);

  const openNotif = (path: string) => {
    setNotifAnchorEl(null);
    navigate(path);
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  // The module we're currently inside (matched by the module hub path or any of
  // its children). Undefined on hub pages like "/" so nothing is highlighted.
  const activeModule = MODULES.find(
    (m) => isActive(m.path) || m.children.some((c) => isActive(c.path)),
  );
  const activeModulePath = activeModule?.path ?? false;
  const activeChildPath = activeModule?.children.find((c) => isActive(c.path))?.path ?? false;
  const subItems = activeModule?.children ?? [];

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
        {/* Top level: modules */}
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <Box
              component="img"
              src={kfgLogo}
              alt="KFG"
              onClick={() => navigate('/')}
              sx={{ height: 40, cursor: 'pointer' }}
            />

            {/* Desktop module tabs */}
            <Tabs
              value={activeModulePath}
              onChange={(_, v) => navigate(v)}
              textColor="inherit"
              sx={{
                display: { xs: 'none', md: 'flex' },
                minHeight: 48,
                '& .MuiTab-root': { color: '#494445' },
                '& .Mui-selected': { color: 'primary.main' },
                '& .MuiTabs-indicator': { backgroundColor: 'primary.main' },
              }}
            >
              {MODULES.map((m) => (
                <Tab
                  key={m.path}
                  label={m.label}
                  value={m.path}
                  disabled={!m.ready}
                  onClick={() => navigate(m.path)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
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
              slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
            >
              {MODULES.flatMap((m) => [
                <MenuItem
                  key={m.path}
                  disabled={!m.ready}
                  selected={m.children.length === 0 && isActive(m.path)}
                  onClick={() => go(m.path)}
                  sx={{ fontWeight: 700 }}
                >
                  {m.label}
                </MenuItem>,
                ...m.children.map((c) => (
                  <MenuItem
                    key={c.path}
                    disabled={!c.ready}
                    selected={isActive(c.path)}
                    onClick={() => go(c.path)}
                    sx={{ pl: 4 }}
                  >
                    {c.label}
                  </MenuItem>
                )),
              ])}
            </Menu>

            <Tooltip title="Home">
              <IconButton onClick={() => navigate('/')} sx={{ color: '#494445' }}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Expiring routes">
              <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)} sx={{ color: '#494445' }}>
                <Badge badgeContent={expiring.length} color="error">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={() => setNotifAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { minWidth: 280, maxWidth: 360, mt: 1 } } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>Route validity</Typography>
              </Box>
              <Divider />
              {expiring.length === 0 ? (
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">No routes expiring soon.</Typography>
                </Box>
              ) : (
                expiring.map(({ route, days }) => (
                  <MenuItem key={route.id} onClick={() => openNotif(`/logistics/routes/${route.id}`)}>
                    <ListItemText
                      primary={route.reference || route.shipping_line || `Route ${route.id}`}
                      secondary={expiryLabel(days)}
                      secondaryTypographyProps={{ color: isUrgent(days) ? 'error.main' : 'warning.main', fontWeight: 600 }}
                    />
                  </MenuItem>
                ))
              )}
            </Menu>
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

        {/* Second level: sub-sections of the active module (desktop only) */}
        {subItems.length > 0 && (
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 2,
              px: { xs: 2, sm: 3 },
              bgcolor: 'rgba(255,255,255,0.35)',
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {/* Invisible logo spacer: aligns the sub-bar under the first module tab */}
            <Box
              component="img"
              src={kfgLogo}
              alt=""
              aria-hidden
              sx={{ height: 40, visibility: 'hidden', flexShrink: 0 }}
            />
            <Tabs
              value={activeChildPath}
              onChange={(_, v) => navigate(v)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
              sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 40,
                '& .MuiTab-root': { color: '#6b6465', minHeight: 40, py: 0 },
                '& .Mui-selected': { color: 'primary.main' },
                '& .MuiTabs-indicator': { backgroundColor: 'primary.main' },
              }}
            >
              {subItems.map((c) => (
                <Tab
                  key={c.path}
                  label={c.label}
                  value={c.path}
                  disabled={!c.ready}
                  onClick={() => navigate(c.path)}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                />
              ))}
            </Tabs>
          </Box>
        )}
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
