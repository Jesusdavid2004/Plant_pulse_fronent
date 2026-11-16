import { useTranslation } from 'react-i18next';
import type { PetProfile } from '../types';

const PERCENT = 100;

interface PetStatsProps {
  profile: PetProfile;
}

export function PetStats({ profile }: PetStatsProps) {
  const { t } = useTranslation();
  const progress = Math.min(
    PERCENT,
    Math.round((profile.xpIntoLevel / profile.xpForNextLevel) * PERCENT),
  );

  return (
    <div className="flex flex-wrap items-center gap-4">
      <p className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-sm font-bold text-[var(--color-primary-contrast)]">
        {t('hub.level', { level: profile.level })}
      </p>
      <div className="min-w-40 flex-1">
        <div className="mb-1 flex justify-between text-xs text-[var(--color-text-secondary)]">
          <span>{t('hub.xp')}</span>
          <span>
            {profile.xpIntoLevel} / {profile.xpForNextLevel}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={t('hub.xp')}
          aria-valuemin={0}
          aria-valuemax={profile.xpForNextLevel}
          aria-valuenow={profile.xpIntoLevel}
          className="h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-hover)]"
        >
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)]">
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 rounded-full bg-[var(--color-pet-sun)]"
        />
        {t('hub.coins', { count: profile.coins })}
      </p>
    </div>
  );
}
