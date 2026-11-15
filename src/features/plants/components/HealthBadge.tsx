import { useTranslation } from 'react-i18next';
import type { HealthStatus } from '../types';

const STATUS_CLASSES: Record<HealthStatus, string> = {
  healthy: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy-text)]',
  warning: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]',
  critical: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical-text)]',
};

interface HealthBadgeProps {
  status: HealthStatus;
  score: number;
}

export function HealthBadge({ status, score }: HealthBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {t(`health.${status}`)}
      <span aria-hidden="true">·</span>
      <span>{t('health.score', { score })}</span>
    </span>
  );
}
