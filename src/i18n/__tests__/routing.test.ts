import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  detectLocale,
  localizedPath,
  persistLocale,
  switchLocaleInPath,
  LOCALE_COOKIE,
} from '../routing';

function clearLocaleCookie(): void {
  document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
}

afterEach(() => {
  clearLocaleCookie();
  vi.restoreAllMocks();
});

describe('detectLocale', () => {
  it('prefers the locale stored in the NEXT_LOCALE cookie', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
    persistLocale('es');

    expect(detectLocale()).toBe('es');
  });

  it('uses the browser language on the first visit', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR', 'es-CO', 'en']);

    expect(detectLocale()).toBe('es');
  });

  it('falls back to English for unsupported languages', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-DE']);

    expect(detectLocale()).toBe('en');
  });
});

describe('localized paths', () => {
  it('prefixes paths with the locale and keeps the root clean', () => {
    expect(localizedPath('es', '/dashboard')).toBe('/es/dashboard');
    expect(localizedPath('en', '/')).toBe('/en');
    expect(localizedPath('en')).toBe('/en');
  });

  it('swaps the locale while keeping the rest of the path', () => {
    expect(switchLocaleInPath('/en/plants/123', 'es')).toBe('/es/plants/123');
    expect(switchLocaleInPath('/es', 'en')).toBe('/en');
  });
});
