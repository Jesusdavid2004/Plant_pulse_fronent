import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Spinner } from './components/ui/Spinner';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { AuthProvider } from './features/auth/hooks/AuthProvider';
import { LocaleLayout } from './i18n/LocaleLayout';
import { detectLocale, localizedPath } from './i18n/routing';
import { ThemeProvider } from './theme/ThemeProvider';

const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PlantDetailPage = lazy(() => import('./pages/PlantDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Navigate to={localizedPath(detectLocale())} replace />} />
              <Route path="/:locale" element={<LocaleLayout />}>
                <Route element={<AppShell />}>
                  <Route index element={<HomePage />} />
                  <Route path="login" element={<AuthPage mode="login" />} />
                  <Route path="register" element={<AuthPage mode="register" />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="plants/:id" element={<PlantDetailPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
