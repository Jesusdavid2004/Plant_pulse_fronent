import { useTranslation } from 'react-i18next';
import { needKey } from '../moodPresentation';
import type { NeedLevel, NeedStatus } from '../types';

const LEVEL_COLOR_VAR: Record<NeedLevel, string> = {
  SATISFIED: 'var(--color-success)',
  LOW: 'var(--color-warning)',
  CRITICAL: 'var(--color-danger)',
};

const LEVEL_FILL_PERCENT: Record<NeedLevel, number> = {
  SATISFIED: 100,
  LOW: 55,
  CRITICAL: 22,
};

const LEVEL_KEY: Record<NeedLevel, string> = {
  SATISFIED: 'satisfied',
  LOW: 'low',
  CRITICAL: 'critical',
};

interface NeedMetersProps {
  needs: NeedStatus[];
}

export function NeedMeters({ needs }: NeedMetersProps) {
  const { t } = useTranslation();

  return (
    <ul className="space-y-3">
      {needs.map((need) => (
        <li key={need.type}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium text-[var(--color-text)]">
              {t(`pet.actions.${needKey(need.type)}`)}
            </span>
            <span className="text-[var(--color-text-secondary)]">
              {t(`pet.level.${LEVEL_KEY[need.level]}`)} ·{' '}
              {need.daysSinceLastCare === 0
                ? t('pet.today')
                : t('pet.daysAgo', { count: need.daysSinceLastCare })}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${LEVEL_FILL_PERCENT[need.level]}%`,
                backgroundColor: LEVEL_COLOR_VAR[need.level],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
