import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { GameIcon } from './GameIcons';
import {
  createMemoryState,
  flipCard,
  isComplete,
  isResolving,
  resolveFlip,
  scoreForMoves,
  type MemoryState,
} from './memoryEngine';

const MISMATCH_DELAY_MS = 800;

interface MemoryMatchGameProps {
  onFinish: (score: number) => void;
}

export function MemoryMatchGame({ onFinish }: MemoryMatchGameProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<MemoryState | null>(null);

  useEffect(() => {
    if (!state || !isResolving(state)) return;
    const timer = window.setTimeout(() => setState(resolveFlip(state)), MISMATCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  const finished = state !== null && isComplete(state);
  const finalMoves = state?.moves ?? 0;
  useEffect(() => {
    if (finished) onFinish(scoreForMoves(finalMoves));
  }, [finished, finalMoves, onFinish]);

  if (!state) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('games.memory.instructions')}
        </p>
        <Button onClick={() => setState(createMemoryState(Math.random))}>{t('games.start')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[var(--color-text)]" aria-live="polite">
        {t('games.memory.moves', { count: state.moves })}
      </p>
      <ul className="mx-auto grid max-w-sm grid-cols-4 gap-2">
        {state.cards.map((card, index) => {
          const revealed = card.matched || state.faceUp.includes(card.id);
          const label = revealed
            ? t('games.memory.cardUp', { symbol: t(`games.symbols.${card.symbol}`) })
            : t('games.memory.cardDown', { number: index + 1 });
          return (
            <li key={card.id}>
              <button
                type="button"
                aria-label={label}
                disabled={card.matched}
                onClick={() => setState(flipCard(state, card.id))}
                className={`flex aspect-square w-full items-center justify-center rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                  revealed
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-raised)]'
                } ${card.matched ? 'opacity-70' : ''}`}
              >
                {revealed && <GameIcon symbol={card.symbol} className="h-2/3 w-2/3" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
