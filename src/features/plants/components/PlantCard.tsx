import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '../../../i18n/LocalizedLink';
import { statusForScore } from '../health';
import type { Plant } from '../types';
import { HealthBadge } from './HealthBadge';
import { PlantPetCharacter } from '../../plant-pet/components/PlantPetCharacter';
import { moodForScore } from '../../plant-pet/moodPresentation';

export function PlantCard({ plant }: { plant: Plant }) {
  const { t } = useTranslation();
  const score = plant.latestHealthScore;

  return (
    <LocalizedLink
      to={`/plants/${plant.id}`}
      className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
    >
      <div className="mx-auto w-32" aria-hidden="true">
        <PlantPetCharacter
          mood={moodForScore(score)}
          effect={null}
          urgentNeed={null}
          label={plant.name}
          traits={plant.petTraits}
          interactive={false}
        />
      </div>
      <h3 className="mt-2 truncate text-lg font-semibold text-[var(--color-text)]">{plant.name}</h3>
      <p className="truncate text-sm text-[var(--color-text-secondary)]">
        {plant.species ?? t('plant.unknownSpecies')}
      </p>
      {score !== null && (
        <div className="mt-3">
          <HealthBadge status={statusForScore(score)} score={score} />
        </div>
      )}
    </LocalizedLink>
  );
}
