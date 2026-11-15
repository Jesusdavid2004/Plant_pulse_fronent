import { useTranslation } from 'react-i18next';
import { usePlantPet } from '../hooks/usePlantPet';
import { needKey, resolveMessageKey } from '../moodPresentation';
import { CareActions } from './CareActions';
import { NeedMeters } from './NeedMeters';
import { PlantPetCharacter } from './PlantPetCharacter';
import { SpeechBubble } from './SpeechBubble';

interface PlantPetProps {
  plantId: string;
  plantName: string;
}

export function PlantPet({ plantId, plantName }: PlantPetProps) {
  const { t } = useTranslation();
  const { snapshot, status, pendingCare, activeEffect, logCare, reload } = usePlantPet(plantId);

  if (status === 'loading' && !snapshot) {
    return (
      <p role="status" className="py-10 text-center text-[var(--color-text-secondary)]">
        {t('pet.loading')}
      </p>
    );
  }

  if (status === 'error' || !snapshot) {
    return (
      <div role="alert" className="space-y-3 py-10 text-center">
        <p className="text-[var(--color-danger)]">{t('pet.error')}</p>
        <button
          type="button"
          onClick={() => void reload()}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          {t('pet.retry')}
        </button>
      </div>
    );
  }

  const message = activeEffect
    ? t(`pet.thanks.${needKey(activeEffect)}`)
    : t(resolveMessageKey(snapshot));

  return (
    <section aria-label={t('pet.title', { name: plantName })} className="space-y-5">
      <SpeechBubble message={message} />
      <PlantPetCharacter
        mood={snapshot.mood}
        effect={activeEffect}
        urgentNeed={snapshot.mostUrgentNeed}
        label={t('pet.characterLabel', { name: plantName, mood: t(`pet.mood.${snapshot.mood.toLowerCase()}`) })}
      />
      <CareActions pendingCare={pendingCare} urgentNeed={snapshot.mostUrgentNeed} onCare={(type) => void logCare(type)} />
      <NeedMeters needs={snapshot.needs} />
      <p className="text-xs text-[var(--color-text-muted)]">{t('pet.disclaimer')}</p>
    </section>
  );
}
