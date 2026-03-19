import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import theme from './theme';
import CustomersPage from './pages/customers/CustomersPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import ItemsPage from './pages/items/ItemsPage';
import ItemDetailPage from './pages/items/ItemDetailPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
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
                sx={{ color: 'inherit', textDecoration: 'none', letterSpacing: '-0.3px' }}
              >
                KFG Pricing
              </Typography>
            </Toolbar>
          </AppBar>

          <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, maxWidth: 1200, width: '100%', mx: 'auto' }}>
            <Routes>
              <Route path="/" element={<CustomersPage />} />
              <Route path="/customers/:customerId/suppliers" element={<SuppliersPage />} />
              <Route path="/customers/:customerId/suppliers/:supplierId/items" element={<ItemsPage />} />
              <Route path="/items/:itemId" element={<ItemDetailPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
