import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth';

export const AdminGuard = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};
