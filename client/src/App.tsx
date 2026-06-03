import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import SignInPage from './pages/auth/SignInPage';
import HomePage from './pages/home/HomePage';
import CustomersPage from './pages/customers/CustomersPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import ItemsPage from './pages/items/ItemsPage';
import ItemDetailPage from './pages/items/ItemDetailPage';

function ProtectedLayout() {
  const { isAuthenticated, logout, username } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.08)', width: '100%' }}
      >
        <Toolbar>
          <Typography
            component="a"
            href="/"
            variant="h6"
            fontWeight={700}
            sx={{ color: 'inherit', textDecoration: 'none', letterSpacing: '-0.3px', flexGrow: 1 }}
          >
            KFG Pricing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {username}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={logout}
            sx={{ opacity: 0.7, borderColor: 'rgba(255,255,255,0.2)' }}
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
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<SignInPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:customerId/suppliers" element={<SuppliersPage />} />
              <Route path="/customers/:customerId/suppliers/:supplierId/items" element={<ItemsPage />} />
              <Route path="/items/:itemId" element={<ItemDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
