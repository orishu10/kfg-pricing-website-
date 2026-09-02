import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth';
import type { AppModule } from '../api';

export const ModuleGuard = ({ module }: { module: AppModule }) => {
  const { canAccess } = useAuth();
  return canAccess(module) ? <Outlet /> : <Navigate to="/" replace />;
};
