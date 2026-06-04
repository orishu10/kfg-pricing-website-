import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import theme from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SignInPage from "./pages/auth/SignInPage";
import HomePage from "./pages/home/HomePage";
import CustomersPage from "./pages/customers/CustomersPage";
import SuppliersPage from "./pages/suppliers/SuppliersPage";
import ItemsPage from "./pages/items/ItemsPage";
import ItemDetailPage from "./pages/items/ItemDetailPage";
import kfgBackground from "../public/background-logo.svg";

function ProtectedLayout() {
  const { isAuthenticated, logout, username } = useAuth();
  const navigate = useNavigate();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#c8c8c8",
        backgroundImage: kfgBackground,
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
        }}
      >
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
              <Route
                path="/customers/:customerId/suppliers"
                element={<SuppliersPage />}
              />
              <Route
                path="/customers/:customerId/suppliers/:supplierId/items"
                element={<ItemsPage />}
              />
              <Route path="/items/:itemId" element={<ItemDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
