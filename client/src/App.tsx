import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './layout/AuthGuard';
import { AppLayout } from './layout/AppLayout';

// Each page loads as its own chunk only when first visited
const SignInPage = lazy(() => import('./pages/auth/SignInPage'));
const HomePage = lazy(() => import('./pages/home/HomePage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage'));
const ItemsPage = lazy(() => import('./pages/items/ItemsPage'));
const ItemDetailPage = lazy(() => import('./pages/items/components/ItemDetailPage'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress />
  </Box>
);

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<SignInPage />} />
            <Route element={<AuthGuard />}>
              <Route path="/" element={<HomePage />} />
              <Route element={<AppLayout />}>
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:customerId/suppliers" element={<SuppliersPage />} />
                <Route path="/customers/:customerId/suppliers/:supplierId/items" element={<ItemsPage />} />
                <Route path="/items/:itemId" element={<ItemDetailPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
