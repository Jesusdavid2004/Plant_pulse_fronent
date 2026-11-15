import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  isThemePreference,
  ThemeContext,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from './themeContext';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : 'system';
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference);
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystem(event.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = preference === 'system' ? system : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }, [preference, resolvedTheme]);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
