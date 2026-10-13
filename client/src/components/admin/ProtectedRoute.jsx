import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoadingBlock } from './ui';

/** Protege las rutas del panel: hay una única cuenta de administración con acceso a todo */
export default function ProtectedRoute() {
  const { user, ready } = useAuthStore();
  const location = useLocation();

  if (!ready) return <LoadingBlock />;
  if (!user) return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
