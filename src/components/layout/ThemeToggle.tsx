import { useTranslation } from 'react-i18next';
import { THEME_PREFERENCES, useTheme } from '../../theme/themeContext';

const ICONS = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙',
} as const;

export function ThemeToggle() {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="group"
      aria-label={t('nav.theme')}
      className="flex rounded-xl border border-[var(--color-border)] p-0.5"
    >
      {THEME_PREFERENCES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === preference}
          aria-label={t(`theme.${option}`)}
          title={t(`theme.${option}`)}
          onClick={() => setPreference(option)}
          className={`min-h-9 min-w-9 rounded-lg px-2 text-base focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
            option === preference
              ? 'bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-primary)]'
              : 'hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <span aria-hidden="true">{ICONS[option]}</span>
        </button>
      ))}
    </div>
  );
}
