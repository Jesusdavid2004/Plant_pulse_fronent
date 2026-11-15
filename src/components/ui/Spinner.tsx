import { useTranslation } from 'react-i18next';

export function Spinner({ label }: { label?: string }) {
  const { t } = useTranslation();

  return (
    <div role="status" className="flex flex-col items-center gap-3 py-12">
      <span
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]"
      />
      <span className="text-sm text-[var(--color-text-secondary)]">
        {label ?? t('common.loading')}
      </span>
    </div>
  );
}
