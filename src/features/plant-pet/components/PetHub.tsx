import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PetTraits } from '../../plants/types';
import { usePetProfile } from '../hooks/usePetProfile';
import type { GameResult, LoggedCare, Reward } from '../types';
import { GamePanel } from './GamePanel';
import { PetStats } from './PetStats';
import { PlantPet } from './PlantPet';
import { WardrobePanel } from './WardrobePanel';

const TABS = ['care', 'play', 'wardrobe'] as const;
type Tab = (typeof TABS)[number];

interface PetHubProps {
  plantId: string;
  plantName: string;
  traits: PetTraits;
}

interface Notice {
  reward: Reward;
  leveledUp: boolean;
}

export function PetHub({ plantId, plantName, traits }: PetHubProps) {
  const { t } = useTranslation();
  const { profile, status, busy, actionError, replaceProfile, reload, equip, buyPot } =
    usePetProfile(plantId);
  const [tab, setTab] = useState<Tab>('care');
  const [notice, setNotice] = useState<Notice | null>(null);

  const onCareLogged = useCallback(
    (care: LoggedCare) => {
      setNotice({ reward: care.reward, leveledUp: care.leveledUp });
      void reload();
    },
    [reload],
  );

  const onGameResult = useCallback(
    (result: GameResult) => {
      setNotice({ reward: result.reward, leveledUp: result.leveledUp });
      replaceProfile(result.profile);
    },
    [replaceProfile],
  );

  if (status === 'loading' && !profile) {
    return (
      <p role="status" className="py-10 text-center text-[var(--color-text-secondary)]">
        {t('pet.loading')}
      </p>
    );
  }

  if (status === 'error' || !profile) {
    return (
      <div role="alert" className="space-y-3 py-10 text-center">
        <p className="text-[var(--color-danger)]">{t('pet.error')}</p>
        <button
          type="button"
          onClick={() => void reload()}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
        >
          {t('pet.retry')}
        </button>
      </div>
    );
  }

  const hasReward = notice !== null && (notice.reward.xp > 0 || notice.reward.coins > 0);

  return (
    <div className="space-y-4">
      <PetStats profile={profile} />

      <div role="status" aria-live="polite" className="min-h-6 text-sm font-medium">
        {notice?.leveledUp && (
          <p className="text-[var(--color-primary)]">
            {t('hub.levelUp', { level: profile.level })}
          </p>
        )}
        {hasReward && (
          <p className="text-[var(--color-text)]">
            {t('hub.reward', { xp: notice.reward.xp, coins: notice.reward.coins })}
          </p>
        )}
      </div>

      <div
        role="tablist"
        aria-label={t('hub.tabs')}
        className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--color-surface-hover)] p-1"
      >
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`hub-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`hub-panel-${id}`}
            onClick={() => setTab(id)}
            className={`min-h-11 rounded-lg px-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
              tab === id
                ? 'bg-[var(--color-surface-raised)] text-[var(--color-text)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            {t(`hub.tab.${id}`)}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`hub-panel-${tab}`}
        aria-labelledby={`hub-tab-${tab}`}
        tabIndex={0}
        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        {tab === 'care' && (
          <PlantPet
            plantId={plantId}
            plantName={plantName}
            traits={traits}
            scene={profile.scene}
            pot={profile.pot}
            onCareLogged={onCareLogged}
          />
        )}
        {tab === 'play' && (
          <GamePanel
            plantId={plantId}
            traits={traits}
            pot={profile.pot}
            dailyCoinsRemaining={profile.dailyCoinsRemaining}
            onResult={onGameResult}
          />
        )}
        {tab === 'wardrobe' && (
          <WardrobePanel
            profile={profile}
            busy={busy}
            failed={actionError}
            onEquipScene={(scene) => void equip({ scene })}
            onEquipPot={(pot) => void equip({ pot })}
            onBuyPot={(pot) => void buyPot(pot)}
          />
        )}
      </div>
    </div>
  );
}
