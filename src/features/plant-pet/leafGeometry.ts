import type { LeafShape, PetTraits } from '../plants/types';

export const DEFAULT_PET_TRAITS: PetTraits = { leafShape: 'POINTED', leafCount: 3 };

export const LEAF_PATHS: Record<LeafShape, string> = {
  POINTED: 'M0 0 C-24 -22 -22 -62 0 -88 C22 -62 24 -22 0 0 Z',
  ROUND: 'M0 0 C-34 -14 -34 -62 0 -70 C34 -62 34 -14 0 0 Z',
  LONG: 'M0 0 C-13 -30 -13 -80 0 -108 C13 -80 13 -30 0 0 Z',
  SPIKY: 'M0 0 C-8 -30 -7 -72 0 -112 C7 -72 8 -30 0 0 Z',
  HEART:
    'M0 0 C-26 -14 -30 -52 -13 -66 C-6 -72 0 -66 0 -58 C0 -66 6 -72 13 -66 C30 -52 26 -14 0 0 Z',
};

const MIN_LEAVES = 3;
const BASE_SPREAD_DEGREES = 52;
const SPREAD_GROWTH_PER_EXTRA_LEAF = 6;
const MAX_SPREAD_DEGREES = 78;
const SCALE_LOSS_PER_EXTRA_LEAF = 0.05;
const MIN_SCALE = 0.7;
const DROOP_BASE_RATIO = 0.35;
const DROOP_EDGE_RATIO = 0.65;
const CENTER_DROOP_RATIO = 0.3;

export interface LeafPose {
  key: number;
  baseAngle: number;
  droopRatio: number;
  swayRatio: number;
}

export function leafScale(leafCount: number): number {
  return Math.max(MIN_SCALE, 1 - (leafCount - MIN_LEAVES) * SCALE_LOSS_PER_EXTRA_LEAF);
}

export function buildLeafPoses(leafCount: number): LeafPose[] {
  const count = Math.max(MIN_LEAVES, leafCount);
  const spread = Math.min(
    MAX_SPREAD_DEGREES,
    BASE_SPREAD_DEGREES + (count - MIN_LEAVES) * SPREAD_GROWTH_PER_EXTRA_LEAF,
  );

  return Array.from({ length: count }, (_, index) => {
    const position = count === 1 ? 0 : (index / (count - 1)) * 2 - 1;
    const edgeness = Math.abs(position);
    const direction = Math.sign(position);
    const isCenter = direction === 0;
    return {
      key: index,
      baseAngle: position * spread,
      droopRatio: isCenter
        ? CENTER_DROOP_RATIO
        : direction * (DROOP_BASE_RATIO + DROOP_EDGE_RATIO * edgeness),
      swayRatio: isCenter ? 0.5 : 0.6 + 0.4 * edgeness,
    };
  });
}
