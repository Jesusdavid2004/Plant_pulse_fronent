import { describe, expect, it } from 'vitest';
import {
  BAD_DROP_PENALTY,
  CATCH_LINE_Y,
  createDropCatchState,
  GAME_DURATION_SECONDS,
  isGameOver,
  MAX_SCORE,
  movePlayer,
  stepDropCatch,
  type DropCatchState,
} from '../games/dropCatchEngine';
import {
  createMemoryState,
  flipCard,
  isComplete,
  isResolving,
  MEMORY_SYMBOLS,
  resolveFlip,
  scoreForMoves,
  shuffle,
} from '../games/memoryEngine';

const alwaysZero = () => 0;
const neverBad = () => 0.9;

function withDrop(kind: 'water' | 'bug', x: number, playerX: number, score = 5): DropCatchState {
  return {
    ...createDropCatchState(),
    playerX,
    score,
    spawnCountdown: 10,
    drops: [{ id: 1, x, y: CATCH_LINE_Y - 0.001, kind }],
  };
}

describe('drop catch engine', () => {
  it('scores a point when the plant catches a water drop', () => {
    const next = stepDropCatch(withDrop('water', 0.5, 0.5), 0.05, neverBad);

    expect(next.score).toBe(6);
    expect(next.drops).toHaveLength(0);
  });

  it('does not score a drop that falls beside the plant', () => {
    const next = stepDropCatch(withDrop('water', 0.1, 0.9), 0.05, neverBad);

    expect(next.score).toBe(5);
  });

  it('takes points away for a bug but never goes below zero', () => {
    expect(stepDropCatch(withDrop('bug', 0.5, 0.5), 0.05, neverBad).score).toBe(
      5 - BAD_DROP_PENALTY,
    );
    expect(stepDropCatch(withDrop('bug', 0.5, 0.5, 1), 0.05, neverBad).score).toBe(0);
  });

  it('keeps the plant inside the play area', () => {
    const state = createDropCatchState();

    expect(movePlayer(state, -3).playerX).toBe(0);
    expect(movePlayer(state, 4).playerX).toBe(1);
  });

  it('spawns drops over time and ends when the time is up', () => {
    let state = createDropCatchState();
    state = stepDropCatch(state, 0.1, alwaysZero);
    expect(state.drops.length).toBeGreaterThan(0);

    state = { ...state, secondsLeft: 0.01 };
    state = stepDropCatch(state, 0.1, alwaysZero);
    expect(isGameOver(state)).toBe(true);
    expect(stepDropCatch(state, 1, alwaysZero)).toBe(state);
    expect(GAME_DURATION_SECONDS).toBeGreaterThan(0);
  });

  it('never exceeds the maximum score the server accepts', () => {
    const next = stepDropCatch(withDrop('water', 0.5, 0.5, MAX_SCORE), 0.05, neverBad);

    expect(next.score).toBe(MAX_SCORE);
  });
});

describe('memory engine', () => {
  it('deals every symbol twice', () => {
    const { cards } = createMemoryState(Math.random);

    expect(cards).toHaveLength(MEMORY_SYMBOLS.length * 2);
    for (const symbol of MEMORY_SYMBOLS) {
      expect(cards.filter((card) => card.symbol === symbol)).toHaveLength(2);
    }
  });

  it('shuffles without losing or repeating items', () => {
    const items = [1, 2, 3, 4, 5];

    expect([...shuffle(items, Math.random)].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps a matching pair face up and counts one move per pair of flips', () => {
    let state = createMemoryState(alwaysZero);
    const first = state.cards[0]!;
    const twin = state.cards.find((card) => card.id !== first.id && card.symbol === first.symbol)!;

    state = flipCard(state, first.id);
    expect(state.moves).toBe(0);
    state = flipCard(state, twin.id);
    expect(state.moves).toBe(1);
    expect(isResolving(state)).toBe(true);
    state = resolveFlip(state);

    expect(state.cards.filter((card) => card.matched)).toHaveLength(2);
    expect(state.faceUp).toEqual([]);
  });

  it('turns a mismatched pair back over and ignores a third flip while resolving', () => {
    let state = createMemoryState(alwaysZero);
    const first = state.cards[0]!;
    const other = state.cards.find((card) => card.symbol !== first.symbol)!;
    const third = state.cards.find((card) => ![first.id, other.id].includes(card.id))!;

    state = flipCard(flipCard(state, first.id), other.id);
    expect(flipCard(state, third.id)).toBe(state);
    state = resolveFlip(state);

    expect(state.cards.some((card) => card.matched)).toBe(false);
    expect(state.faceUp).toEqual([]);
  });

  it('completes when every pair is found and rewards fewer moves', () => {
    let state = createMemoryState(alwaysZero);
    for (const symbol of MEMORY_SYMBOLS) {
      const pair = state.cards.filter((card) => card.symbol === symbol);
      state = resolveFlip(flipCard(flipCard(state, pair[0]!.id), pair[1]!.id));
    }

    expect(isComplete(state)).toBe(true);
    expect(scoreForMoves(state.moves)).toBe(MAX_SCORE);
    expect(scoreForMoves(MEMORY_SYMBOLS.length + 4)).toBeLessThan(MAX_SCORE);
    expect(scoreForMoves(1000)).toBeGreaterThan(0);
  });
});
