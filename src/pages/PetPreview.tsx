import { useTranslation } from 'react-i18next';
import { PlantPetCharacter } from '../features/plant-pet/components/PlantPetCharacter';
import { MOODS, type CareType, type Mood } from '../features/plant-pet/types';

const URGENT_NEED_BY_MOOD: Record<Mood, CareType | null> = {
  HAPPY: null,
  CONCERNED: 'WATER',
  SAD: 'SUN',
  SICK: null,
};

const PetPreview = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-[var(--color-text)]">{t('petPreview.title')}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MOODS.map((mood) => {
          const moodName = t(`pet.mood.${mood.toLowerCase()}`);
          return (
            <section
              key={mood}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <PlantPetCharacter
                mood={mood}
                effect={null}
                urgentNeed={URGENT_NEED_BY_MOOD[mood]}
                label={t('pet.characterLabel', { name: t('petPreview.sampleName'), mood: moodName })}
              />
              <h2 className="mt-3 text-center text-lg font-semibold capitalize text-[var(--color-text)]">
                {moodName}
              </h2>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default PetPreview;
