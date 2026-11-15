import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../i18n/LocalizedLink';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-5xl" aria-hidden="true">
        🥀
      </p>
      <h1 className="text-3xl font-bold text-[var(--color-text)]">{t('notFound.title')}</h1>
      <p className="text-[var(--color-text-secondary)]">{t('notFound.body')}</p>
      <LocalizedLink to="/" className="font-semibold text-[var(--color-primary)] underline">
        {t('notFound.home')}
      </LocalizedLink>
    </div>
  );
}
