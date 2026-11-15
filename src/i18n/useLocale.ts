import { useCallback } from 'react';
import { useNavigate, useParams, type NavigateOptions } from 'react-router-dom';
import { DEFAULT_LOCALE, isLocale, localizedPath, type Locale } from './routing';

export function useLocale(): Locale {
  const { locale } = useParams<{ locale: string }>();
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function useLocalizedNavigate() {
  const navigate = useNavigate();
  const locale = useLocale();

  return useCallback(
    (path: string, options?: NavigateOptions) => navigate(localizedPath(locale, path), options),
    [navigate, locale],
  );
}
