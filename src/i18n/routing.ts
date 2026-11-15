export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

function readLocaleCookie(): Locale | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return isLocale(value) ? value : null;
}

export function persistLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function detectLocale(): Locale {
  const stored = readLocaleCookie();
  if (stored) return stored;

  for (const language of navigator.languages) {
    const candidate = language.slice(0, 2).toLowerCase();
    if (isLocale(candidate)) return candidate;
  }
  return DEFAULT_LOCALE;
}

export function localizedPath(locale: Locale, path = ''): string {
  return `/${locale}${path === '/' ? '' : path}`;
}

export function switchLocaleInPath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/');
  segments[1] = locale;
  return segments.join('/') || localizedPath(locale);
}
