export const GAME_DURATION_SECONDS = 30;
export const MAX_SCORE = 40;
export const CATCH_LINE_Y = 0.86;
export const CATCH_HALF_WIDTH = 0.13;
export const PLAYER_STEP = 0.07;
export const BAD_DROP_PENALTY = 2;

const FALL_SPEED_PER_SECOND = 0.42;
const SPAWN_INTERVAL_SECONDS = 0.62;
const BAD_DROP_CHANCE = 0.2;
const SPAWN_MARGIN = 0.08;
const MISSED_LINE_Y = 1.05;

export type DropKind = 'water' | 'bug';

export interface Drop {
  id: number;
  x: number;
  y: number;
  kind: DropKind;
}

export interface DropCatchState {
  playerX: number;
  drops: Drop[];
  score: number;
  secondsLeft: number;
  spawnCountdown: number;
  nextId: number;
}

export type RandomSource = () => number;

export function createDropCatchState(): DropCatchState {
  return {
    playerX: 0.5,
    drops: [],
    score: 0,
    secondsLeft: GAME_DURATION_SECONDS,
    spawnCountdown: 0,
    nextId: 1,
  };
}

export function clampPosition(position: number): number {
  return Math.min(1, Math.max(0, position));
}

export function movePlayer(state: DropCatchState, playerX: number): DropCatchState {
  return { ...state, playerX: clampPosition(playerX) };
}

export function isGameOver(state: DropCatchState): boolean {
  return state.secondsLeft <= 0;
}

function spawnDrop(state: DropCatchState, random: RandomSource): DropCatchState {
  const drop: Drop = {
    id: state.nextId,
    x: SPAWN_MARGIN + random() * (1 - 2 * SPAWN_MARGIN),
    y: 0,
    kind: random() < BAD_DROP_CHANCE ? 'bug' : 'water',
  };
  return { ...state, drops: [...state.drops, drop], nextId: state.nextId + 1 };
}

export function stepDropCatch(
  state: DropCatchState,
  deltaSeconds: number,
  random: RandomSource,
): DropCatchState {
  if (isGameOver(state)) return state;

  let next: DropCatchState = {
    ...state,
    secondsLeft: Math.max(0, state.secondsLeft - deltaSeconds),
    spawnCountdown: state.spawnCountdown - deltaSeconds,
  };
  while (next.spawnCountdown <= 0) {
    next = spawnDrop(
      { ...next, spawnCountdown: next.spawnCountdown + SPAWN_INTERVAL_SECONDS },
      random,
    );
  }

  let score = next.score;
  const remaining: Drop[] = [];
  for (const drop of next.drops) {
    const moved = { ...drop, y: drop.y + FALL_SPEED_PER_SECOND * deltaSeconds };
    const caught = moved.y >= CATCH_LINE_Y && Math.abs(moved.x - next.playerX) <= CATCH_HALF_WIDTH;
    if (caught) {
      score = moved.kind === 'water' ? score + 1 : Math.max(0, score - BAD_DROP_PENALTY);
    } else if (moved.y < MISSED_LINE_Y) {
      remaining.push(moved);
    }
  }
  return { ...next, drops: remaining, score: Math.min(MAX_SCORE, score) };
}
