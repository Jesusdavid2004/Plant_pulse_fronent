import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { LOCALES, switchLocaleInPath, type Locale } from '../../i18n/routing';
import { useLocale } from '../../i18n/useLocale';

export function LanguageSwitch() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const select = (next: Locale) => {
    if (next !== locale) navigate(`${switchLocaleInPath(pathname, next)}${search}`);
  };

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className="flex rounded-xl border border-[var(--color-border)] p-0.5"
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={option === locale}
          aria-label={t(`nav.languageNames.${option}`)}
          onClick={() => select(option)}
          className={`min-h-9 min-w-10 rounded-lg px-2 text-sm font-semibold uppercase focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
            option === locale
              ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
