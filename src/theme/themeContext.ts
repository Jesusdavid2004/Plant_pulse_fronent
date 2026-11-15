import { createContext, useContext } from 'react';

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

export interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}

export function isThemePreference(value: string | null): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference);
}
