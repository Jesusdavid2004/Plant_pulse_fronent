import { Navigate } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { AuthForm } from '../features/auth/components/AuthForm';
import { useAuth } from '../features/auth/hooks/authContext';
import { localizedPath } from '../i18n/routing';
import { useLocale } from '../i18n/useLocale';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { status } = useAuth();
  const locale = useLocale();

  if (status === 'loading') return <Spinner />;
  if (status === 'authenticated')
    return <Navigate to={localizedPath(locale, '/dashboard')} replace />;
  return <AuthForm mode={mode} />;
}
