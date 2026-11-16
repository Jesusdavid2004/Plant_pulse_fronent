import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import type { PetTraits } from '../../plants/types';
import { PlantFigure, PlantVines } from '../components/PlantFigure';
import { RIM_Y, BASE_X } from '../plantLayout';
import { leafColorVar, potColorVars } from '../traitColors';
import type { PotKey } from '../types';
import {
  CATCH_LINE_Y,
  createDropCatchState,
  GAME_DURATION_SECONDS,
  isGameOver,
  movePlayer,
  PLAYER_STEP,
  stepDropCatch,
  type DropCatchState,
} from './dropCatchEngine';
import { useAnimationLoop } from './useAnimationLoop';

const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 400;
const BUTTON_STEP = 0.12;
const PLAYER_PLANT_SCALE = 0.36;
const STILL_ANGLES = { droop: 0, sway: 0 };

interface DropCatchGameProps {
  traits: PetTraits;
  pot: PotKey;
  onFinish: (score: number) => void;
}

export function DropCatchGame({ traits, pot, onFinish }: DropCatchGameProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<DropCatchState>(createDropCatchState);
  const [playing, setPlaying] = useState(false);
  const areaRef = useRef<SVGSVGElement>(null);
  const stateRef = useRef(state);

  const commit = useCallback((next: DropCatchState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const onFrame = useCallback(
    (delta: number) => {
      const next = stepDropCatch(stateRef.current, delta, Math.random);
      commit(next);
      if (isGameOver(next)) {
        setPlaying(false);
        onFinish(next.score);
      }
    },
    [commit, onFinish],
  );
  useAnimationLoop(playing, onFrame);

  const start = () => {
    commit(createDropCatchState());
    setPlaying(true);
    areaRef.current?.focus();
  };

  const moveTo = (ratio: number) => {
    if (playing) commit(movePlayer(stateRef.current, ratio));
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    moveTo((event.clientX - box.left) / box.width);
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === 'ArrowLeft') moveTo(stateRef.current.playerX - PLAYER_STEP);
    if (event.key === 'ArrowRight') moveTo(stateRef.current.playerX + PLAYER_STEP);
  };

  const potVars = potColorVars(pot);
  const playerPx = state.playerX * VIEW_WIDTH;

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between text-sm font-semibold text-[var(--color-text)]"
        aria-hidden="true"
      >
        <span>{t('games.drop.score', { score: state.score })}</span>
        <span>{t('games.drop.time', { seconds: Math.ceil(state.secondsLeft) })}</span>
      </div>

      <svg
        ref={areaRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="group"
        aria-label={t('games.drop.areaLabel')}
        tabIndex={0}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
        className="mx-auto block w-full max-w-sm touch-none rounded-2xl bg-[var(--color-scene-garden-sky)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        <rect
          x={0}
          y={VIEW_HEIGHT * CATCH_LINE_Y + 20}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          fill="var(--color-scene-garden-ground)"
        />
        {state.drops.map((drop) =>
          drop.kind === 'water' ? (
            <path
              key={drop.id}
              d="M0 -12 C-8 0 -9 4 -9 6 a9 9 0 0 0 18 0 c0-2-1-6-9-18 Z"
              transform={`translate(${drop.x * VIEW_WIDTH} ${drop.y * VIEW_HEIGHT})`}
              fill="var(--color-pet-water)"
            />
          ) : (
            <g
              key={drop.id}
              transform={`translate(${drop.x * VIEW_WIDTH} ${drop.y * VIEW_HEIGHT})`}
            >
              <ellipse rx={9} ry={7} fill="var(--color-pet-ink)" />
              <path
                d="M-6 -5 L-10 -10 M6 -5 L10 -10"
                stroke="var(--color-pet-ink)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </g>
          ),
        )}
        <g transform={`translate(${playerPx} ${VIEW_HEIGHT * CATCH_LINE_Y})`}>
          <g
            transform={`scale(${PLAYER_PLANT_SCALE}) translate(${-BASE_X} ${-RIM_Y})`}
            style={{ color: leafColorVar(traits.leafColor) }}
          >
            <PlantFigure traits={traits} angles={STILL_ANGLES} />
          </g>
          <path d="M-30 0 H30 L24 34 H-24 Z" fill={potVars.base} />
          <rect x={-34} y={-6} width={68} height={12} rx={5} fill={potVars.shade} />
          <g
            transform={`scale(${PLAYER_PLANT_SCALE}) translate(${-BASE_X} ${-RIM_Y})`}
            style={{ color: leafColorVar(traits.leafColor) }}
          >
            <PlantVines traits={traits} angles={STILL_ANGLES} />
          </g>
        </g>
      </svg>

      {playing ? (
        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            aria-label={t('games.drop.left')}
            onClick={() => moveTo(stateRef.current.playerX - BUTTON_STEP)}
          >
            ◀
          </Button>
          <Button
            variant="secondary"
            aria-label={t('games.drop.right')}
            onClick={() => moveTo(stateRef.current.playerX + BUTTON_STEP)}
          >
            ▶
          </Button>
        </div>
      ) : (
        <div className="space-y-2 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('games.drop.instructions', { seconds: GAME_DURATION_SECONDS })}
          </p>
          <Button onClick={start}>{t('games.start')}</Button>
        </div>
      )}
    </div>
  );
}
