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
const DbmPage = lazy(() => import('./pages/dbm/DbmPage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage'));
const ItemsPage = lazy(() => import('./pages/items/ItemsPage'));
const ListsPage = lazy(() => import('./pages/lists/ListsPage'));
const PricingPage = lazy(() => import('./pages/pricing/PricingPage'));
const PricingFormPage = lazy(() => import('./pages/pricing/components/PricingFormPage'));
const LogisticsPage = lazy(() => import('./pages/logistics/LogisticsPage'));
const WeeklyShipmentsPage = lazy(() => import('./pages/logistics/weeklyShipments/WeeklyShipmentsPage'));
const WeeklyShipmentFormPage = lazy(() => import('./pages/logistics/weeklyShipments/components/WeeklyShipmentFormPage'));
const SchedulesPage = lazy(() => import('./pages/logistics/schedules/SchedulesPage'));
const ScheduleFormPage = lazy(() => import('./pages/logistics/schedules/components/ScheduleFormPage'));
const RoutesPage = lazy(() => import('./pages/logistics/routes/RoutesPage'));
const RouteFormPage = lazy(() => import('./pages/logistics/routes/components/RouteFormPage'));

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
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/dbm" element={<DbmPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/incoterms" element={<ListsPage category="incoterms" />} />
                <Route path="/currencies" element={<ListsPage category="currency_pair" />} />
                <Route path="/countries" element={<ListsPage category="country" />} />
                <Route path="/containers" element={<ListsPage category="container" />} />
                <Route path="/shipping-lines" element={<ListsPage category="shipping_line" />} />
                <Route path="/sea-ports" element={<ListsPage category="sea_port" />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/pricing/new" element={<PricingFormPage />} />
                <Route path="/pricing/:pricingId" element={<PricingFormPage />} />
                <Route path="/logistics" element={<LogisticsPage />} />
                <Route path="/logistics/weekly-shipments" element={<WeeklyShipmentsPage />} />
                <Route path="/logistics/weekly-shipments/new" element={<WeeklyShipmentFormPage />} />
                <Route path="/logistics/weekly-shipments/:shipmentId" element={<WeeklyShipmentFormPage />} />
                <Route path="/logistics/schedules" element={<SchedulesPage />} />
                <Route path="/logistics/schedules/new" element={<ScheduleFormPage />} />
                <Route path="/logistics/schedules/:scheduleId" element={<ScheduleFormPage />} />
                <Route path="/logistics/routes" element={<RoutesPage />} />
                <Route path="/logistics/routes/new" element={<RouteFormPage />} />
                <Route path="/logistics/routes/:routeId" element={<RouteFormPage />} />
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
