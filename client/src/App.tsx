import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './layout/AuthGuard';
import { AppLayout } from './layout/AppLayout';
import SignInPage from './pages/auth/SignInPage';
import HomePage from './pages/home/HomePage';
import CustomersPage from './pages/customers/CustomersPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import ItemsPage from './pages/items/ItemsPage';
import ItemDetailPage from './pages/items/components/ItemDetailPage';

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
