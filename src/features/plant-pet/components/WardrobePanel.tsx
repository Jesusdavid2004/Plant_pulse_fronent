import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { potColorVars } from '../traitColors';
import type { PetProfile, PotKey, SceneKey } from '../types';

interface WardrobePanelProps {
  profile: PetProfile;
  busy: boolean;
  failed: boolean;
  onEquipScene: (scene: SceneKey) => void;
  onEquipPot: (pot: PotKey) => void;
  onBuyPot: (pot: PotKey) => void;
}

const OPTION_BASE =
  'flex flex-col items-start gap-2 rounded-2xl border p-3 text-left text-sm focus-within:outline-2 focus-within:outline-[var(--color-primary)]';

export function WardrobePanel({
  profile,
  busy,
  failed,
  onEquipScene,
  onEquipPot,
  onBuyPot,
}: WardrobePanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {failed && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {t('wardrobe.error')}
        </p>
      )}

      <section aria-labelledby="scenes-title" className="space-y-3">
        <h3 id="scenes-title" className="font-semibold text-[var(--color-text)]">
          {t('wardrobe.scenes')}
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {profile.scenes.map((scene) => {
            const active = profile.scene === scene.key;
            return (
              <li
                key={scene.key}
                className={`${OPTION_BASE} ${active ? 'border-[var(--color-primary)] bg-[var(--color-surface-hover)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}
              >
                <span className="font-medium text-[var(--color-text)]">
                  {t(`wardrobe.sceneNames.${scene.key}`)}
                </span>
                {scene.unlocked ? (
                  <Button
                    variant={active ? 'primary' : 'secondary'}
                    aria-pressed={active}
                    disabled={busy || active}
                    onClick={() => onEquipScene(scene.key)}
                  >
                    {active ? t('wardrobe.equipped') : t('wardrobe.equip')}
                  </Button>
                ) : (
                  <span className="text-[var(--color-text-secondary)]">
                    {t('wardrobe.unlocksAt', { level: scene.unlockLevel })}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="pots-title" className="space-y-3">
        <h3 id="pots-title" className="font-semibold text-[var(--color-text)]">
          {t('wardrobe.pots')}
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {profile.pots.map((pot) => {
            const active = profile.pot === pot.key;
            const colors = potColorVars(pot.key);
            const affordable = profile.coins >= pot.price;
            return (
              <li
                key={pot.key}
                className={`${OPTION_BASE} ${active ? 'border-[var(--color-primary)] bg-[var(--color-surface-hover)]' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}
              >
                <span className="flex items-center gap-2 font-medium text-[var(--color-text)]">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
                    <path d="M3 8 H21 L18 22 H6 Z" fill={colors.base} />
                    <rect x={2} y={4} width={20} height={5} rx={2} fill={colors.shade} />
                  </svg>
                  {t(`wardrobe.potNames.${pot.key}`)}
                </span>
                {pot.owned ? (
                  <Button
                    variant={active ? 'primary' : 'secondary'}
                    aria-pressed={active}
                    disabled={busy || active}
                    onClick={() => onEquipPot(pot.key)}
                  >
                    {active ? t('wardrobe.equipped') : t('wardrobe.equip')}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    disabled={busy || !affordable}
                    onClick={() => onBuyPot(pot.key)}
                  >
                    {t('wardrobe.buy', { price: pot.price })}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
