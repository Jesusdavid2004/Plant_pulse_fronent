import { useTranslation } from 'react-i18next';
import { PlantPetCharacter } from '../features/plant-pet/components/PlantPetCharacter';
import { DEFAULT_PET_TRAITS } from '../features/plant-pet/leafGeometry';
import type { PetTraits } from '../features/plants/types';
import { MOODS, type CareType, type Mood } from '../features/plant-pet/types';
import { LocalizedLink } from '../i18n/LocalizedLink';
import { useAuth } from '../features/auth/hooks/authContext';
import { Card } from '../components/ui/Card';

const SHOWCASE_NEED: Record<Mood, CareType | null> = {
  HAPPY: null,
  CONCERNED: 'WATER',
  SAD: 'SUN',
  SICK: null,
};
const HERO_TRAITS: PetTraits = {
  growthForm: 'ROSETTE',
  leafShape: 'GRASS',
  leafCount: 7,
  leafColor: 'DARK_GREEN',
  leafPattern: 'PLAIN',
  bloomShape: 'SPIKE',
  bloomColor: 'PINK',
};
const SHOWCASE_TRAITS: PetTraits = { ...DEFAULT_PET_TRAITS, leafCount: 5 };
const STEPS = ['photo', 'meet', 'care'] as const;

const CTA_CLASS =
  'inline-flex min-h-12 items-center rounded-xl px-6 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]';

export default function HomePage() {
  const { t } = useTranslation();
  const { status } = useAuth();
  const signedIn = status === 'authenticated';

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <h1 className="text-4xl font-extrabold leading-tight text-[var(--color-text)] sm:text-5xl">
            {t('home.title')}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)]">{t('home.subtitle')}</p>
          <div className="flex flex-wrap gap-3">
            <LocalizedLink
              to={signedIn ? '/dashboard' : '/register'}
              className={`${CTA_CLASS} bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-hover)]`}
            >
              {t(signedIn ? 'home.openDashboard' : 'home.getStarted')}
            </LocalizedLink>
            {!signedIn && (
              <LocalizedLink
                to="/login"
                className={`${CTA_CLASS} border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]`}
              >
                {t('nav.login')}
              </LocalizedLink>
            )}
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <PlantPetCharacter
            mood="HAPPY"
            effect={null}
            urgentNeed={null}
            label={t('home.heroPetLabel')}
            traits={HERO_TRAITS}
          />
        </div>
      </section>

      <section aria-labelledby="how-title" className="space-y-6">
        <h2 id="how-title" className="text-2xl font-bold text-[var(--color-text)]">
          {t('home.howTitle')}
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step}>
              <Card className="h-full space-y-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] font-bold text-[var(--color-primary-contrast)]">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {t(`home.steps.${step}.title`)}
                </h3>
                <p className="text-[var(--color-text-secondary)]">{t(`home.steps.${step}.body`)}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="moods-title" className="space-y-6">
        <div className="space-y-1">
          <h2 id="moods-title" className="text-2xl font-bold text-[var(--color-text)]">
            {t('home.moodsTitle')}
          </h2>
          <p className="text-[var(--color-text-secondary)]">{t('home.moodsSubtitle')}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {MOODS.map((mood) => {
            const moodName = t(`pet.mood.${mood.toLowerCase()}`);
            return (
              <Card key={mood} className="space-y-2">
                <PlantPetCharacter
                  mood={mood}
                  effect={null}
                  urgentNeed={SHOWCASE_NEED[mood]}
                  label={moodName}
                  traits={SHOWCASE_TRAITS}
                  interactive={false}
                />
                <p className="text-center font-semibold capitalize text-[var(--color-text)]">
                  {moodName}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        {t('analysis.disclaimer')}
      </p>
    </div>
  );
}
