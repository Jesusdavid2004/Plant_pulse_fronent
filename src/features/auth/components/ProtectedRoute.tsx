import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '../../../components/ui/Spinner';
import { localizedPath } from '../../../i18n/routing';
import { useLocale } from '../../../i18n/useLocale';
import { useAuth } from '../hooks/authContext';

export function ProtectedRoute() {
  const { status } = useAuth();
  const locale = useLocale();
  const location = useLocation();

  if (status === 'loading') return <Spinner />;
  if (status === 'anonymous') {
    return (
      <Navigate to={localizedPath(locale, '/login')} state={{ from: location.pathname }} replace />
    );
  }
  return <Outlet />;
}
