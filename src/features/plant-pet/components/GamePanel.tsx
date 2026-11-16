import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import type { PetTraits } from '../../plants/types';
import { DropCatchGame } from '../games/DropCatchGame';
import { MemoryMatchGame } from '../games/MemoryMatchGame';
import { petService } from '../services/PetService';
import { GAME_TYPES, type GameResult, type GameType, type PotKey } from '../types';

interface GamePanelProps {
  plantId: string;
  traits: PetTraits;
  pot: PotKey;
  dailyCoinsRemaining: number;
  onResult: (result: GameResult) => void;
}

const GAME_KEYS: Record<GameType, string> = {
  DROP_CATCH: 'drop',
  MEMORY_MATCH: 'memory',
};

export function GamePanel({ plantId, traits, pot, dailyCoinsRemaining, onResult }: GamePanelProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<GameType | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);
  const [round, setRound] = useState(0);
  const submitted = useRef(false);

  const finish = useCallback(
    (game: GameType, finalScore: number) => {
      if (submitted.current) return;
      submitted.current = true;
      setScore(finalScore);
      petService
        .submitGame(plantId, game, finalScore)
        .then((saved) => {
          setResult(saved);
          onResult(saved);
        })
        .catch(() => setFailed(true));
    },
    [plantId, onResult],
  );

  const open = (game: GameType) => {
    submitted.current = false;
    setResult(null);
    setFailed(false);
    setSelected(game);
    setRound((current) => current + 1);
  };

  if (selected === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('games.intro', { count: dailyCoinsRemaining })}
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {GAME_TYPES.map((game) => (
            <li
              key={game}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div>
                <h3 className="font-semibold text-[var(--color-text)]">
                  {t(`games.${GAME_KEYS[game]}.title`)}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t(`games.${GAME_KEYS[game]}.summary`)}
                </p>
              </div>
              <Button onClick={() => open(game)}>{t('games.play')}</Button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const finished = result !== null || failed;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--color-text)]">
        {t(`games.${GAME_KEYS[selected]}.title`)}
      </h3>

      {!finished && selected === 'DROP_CATCH' && (
        <DropCatchGame
          key={round}
          traits={traits}
          pot={pot}
          onFinish={(value) => finish('DROP_CATCH', value)}
        />
      )}
      {!finished && selected === 'MEMORY_MATCH' && (
        <MemoryMatchGame key={round} onFinish={(value) => finish('MEMORY_MATCH', value)} />
      )}

      {finished && (
        <div
          role={failed ? 'alert' : 'status'}
          className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center"
        >
          {failed || !result ? (
            <p className="text-[var(--color-danger)]">{t('games.saveError')}</p>
          ) : (
            <>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {t('games.result.score', { score })}
              </p>
              <p className="text-[var(--color-text)]">
                {t('games.result.reward', { xp: result.reward.xp, coins: result.reward.coins })}
              </p>
              {result.reward.coins === 0 && score > 0 && (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t('games.result.dailyLimit')}
                </p>
              )}
            </>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => open(selected)}>{t('games.again')}</Button>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              {t('games.back')}
            </Button>
          </div>
        </div>
      )}

      {!finished && (
        <Button variant="ghost" onClick={() => setSelected(null)}>
          {t('games.back')}
        </Button>
      )}
    </div>
  );
}
