import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import i18n from './index';
import { detectLocale, isLocale, localizedPath, persistLocale } from './routing';

export function LocaleLayout() {
  const { locale } = useParams<{ locale: string }>();
  const { pathname } = useLocation();
  const validLocale = isLocale(locale) ? locale : null;

  useEffect(() => {
    if (!validLocale) return;
    persistLocale(validLocale);
    document.documentElement.lang = validLocale;
    if (i18n.language !== validLocale) void i18n.changeLanguage(validLocale);
  }, [validLocale]);

  if (!validLocale) {
    return <Navigate to={localizedPath(detectLocale(), pathname)} replace />;
  }
  return <Outlet />;
}
