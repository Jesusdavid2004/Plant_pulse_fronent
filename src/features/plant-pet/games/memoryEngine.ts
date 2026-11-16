export const MEMORY_SYMBOLS = ['water', 'sun', 'sparkle', 'leaf', 'flower', 'heart'] as const;
export type MemorySymbol = (typeof MEMORY_SYMBOLS)[number];

const PERFECT_SCORE = 40;
const POINTS_LOST_PER_EXTRA_MOVE = 3;
const MIN_SCORE = 4;

export interface MemoryCard {
  id: number;
  symbol: MemorySymbol;
  matched: boolean;
}

export interface MemoryState {
  cards: MemoryCard[];
  faceUp: number[];
  moves: number;
}

export type RandomSource = () => number;

export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith] as T, result[index] as T];
  }
  return result;
}

export function createMemoryState(random: RandomSource): MemoryState {
  const symbols = shuffle([...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS], random);
  return {
    cards: symbols.map((symbol, id) => ({ id, symbol, matched: false })),
    faceUp: [],
    moves: 0,
  };
}

export function isResolving(state: MemoryState): boolean {
  return state.faceUp.length === 2;
}

export function flipCard(state: MemoryState, cardId: number): MemoryState {
  const card = state.cards.find((candidate) => candidate.id === cardId);
  if (!card || card.matched || state.faceUp.includes(cardId) || isResolving(state)) return state;

  const faceUp = [...state.faceUp, cardId];
  return { ...state, faceUp, moves: faceUp.length === 2 ? state.moves + 1 : state.moves };
}

export function resolveFlip(state: MemoryState): MemoryState {
  if (!isResolving(state)) return state;

  const [first, second] = state.faceUp.map((id) => state.cards.find((card) => card.id === id));
  const isMatch = first !== undefined && second !== undefined && first.symbol === second.symbol;
  const cards = isMatch
    ? state.cards.map((card) =>
        state.faceUp.includes(card.id) ? { ...card, matched: true } : card,
      )
    : state.cards;
  return { ...state, cards, faceUp: [] };
}

export function isComplete(state: MemoryState): boolean {
  return state.cards.every((card) => card.matched);
}

export function scoreForMoves(moves: number): number {
  const extraMoves = Math.max(0, moves - MEMORY_SYMBOLS.length);
  return Math.max(MIN_SCORE, PERFECT_SCORE - extraMoves * POINTS_LOST_PER_EXTRA_MOVE);
}
