import type { LeafShape, PetTraits } from '../plants/types';

export const DEFAULT_PET_TRAITS: PetTraits = {
  growthForm: 'ROSETTE',
  leafShape: 'POINTED',
  leafCount: 3,
  leafColor: 'GREEN',
  leafPattern: 'PLAIN',
  bloomShape: 'NONE',
  bloomColor: 'PINK',
};

const FROND_LENGTH = 100;
const FROND_PAIRS = 9;
const FROND_FIRST_LEAFLET = 14;
const FROND_BEND = 0.0032;
const FROND_LEAFLET_LENGTH = 30;
const FROND_LEAFLET_TAPER = 0.55;
const FROND_LEAFLET_WIDTH = 5;
const FROND_LEAFLET_SPREAD_DEGREES = 52;
const RADIANS_PER_DEGREE = Math.PI / 180;

function round(value: number): string {
  return value.toFixed(1);
}

function frondPoint(distance: number): { x: number; y: number } {
  return { x: FROND_BEND * distance * distance, y: -distance };
}

function leafletPath(distance: number, side: 1 | -1): string {
  const origin = frondPoint(distance);
  const tangent = Math.atan2(-1, 2 * FROND_BEND * distance);
  const heading = tangent - side * FROND_LEAFLET_SPREAD_DEGREES * RADIANS_PER_DEGREE;
  const length = FROND_LEAFLET_LENGTH * (1 - (FROND_LEAFLET_TAPER * distance) / FROND_LENGTH);
  const tipX = origin.x + Math.cos(heading) * length;
  const tipY = origin.y + Math.sin(heading) * length;
  const midX = (origin.x + tipX) / 2;
  const midY = (origin.y + tipY) / 2;
  const normalX = -Math.sin(heading) * FROND_LEAFLET_WIDTH;
  const normalY = Math.cos(heading) * FROND_LEAFLET_WIDTH;
  return `M${round(origin.x)} ${round(origin.y)} Q${round(midX + normalX)} ${round(midY + normalY)} ${round(tipX)} ${round(tipY)} Q${round(midX - normalX)} ${round(midY - normalY)} ${round(origin.x)} ${round(origin.y)} Z`;
}

function buildFrondPath(): string {
  const step = (FROND_LENGTH - FROND_FIRST_LEAFLET) / FROND_PAIRS;
  const leaflets = Array.from({ length: FROND_PAIRS }, (_, index) => {
    const distance = FROND_FIRST_LEAFLET + index * step;
    return `${leafletPath(distance, 1)} ${leafletPath(distance, -1)}`;
  });
  const tip = frondPoint(FROND_LENGTH);
  const tipLeaflet = `M${round(tip.x)} ${round(tip.y)} l-3 10 l6 0 Z`;
  return `${leaflets.join(' ')} ${tipLeaflet}`;
}

function buildFrondRachis(): string {
  const tip = frondPoint(FROND_LENGTH);
  return `M0 0 Q0 ${round(-FROND_LENGTH / 2)} ${round(tip.x)} ${round(tip.y)}`;
}

export const FROND_RACHIS_PATH = buildFrondRachis();

export const LEAF_PATHS: Record<LeafShape, string> = {
  POINTED: 'M0 0 C-24 -22 -22 -62 0 -88 C22 -62 24 -22 0 0 Z',
  ROUND: 'M0 0 C-34 -14 -34 -62 0 -70 C34 -62 34 -14 0 0 Z',
  LONG: 'M0 0 C-13 -30 -13 -80 0 -108 C13 -80 13 -30 0 0 Z',
  SPIKY: 'M0 0 C-8 -30 -7 -72 0 -112 C7 -72 8 -30 0 0 Z',
  GRASS: 'M0 0 C-5 -40 0 -96 22 -134 C10 -92 7 -40 5 0 Z',
  BROAD: 'M0 0 C-42 -10 -44 -66 0 -86 C44 -66 42 -10 0 0 Z',
  HEART:
    'M0 0 C-26 -14 -30 -52 -13 -66 C-6 -72 0 -66 0 -58 C0 -66 6 -72 13 -66 C30 -52 26 -14 0 0 Z',
  SWORD: 'M-9 0 C-21 -40 -19 -104 0 -150 C19 -104 21 -40 9 0 Z',
  FROND: buildFrondPath(),
};

export const LEAF_LENGTH: Record<LeafShape, number> = {
  POINTED: 88,
  ROUND: 70,
  LONG: 108,
  SPIKY: 112,
  GRASS: 130,
  BROAD: 86,
  HEART: 70,
  SWORD: 150,
  FROND: FROND_LENGTH,
};

export const LEAF_HALF_WIDTH: Record<LeafShape, number> = {
  POINTED: 22,
  ROUND: 34,
  LONG: 13,
  SPIKY: 8,
  GRASS: 6,
  BROAD: 42,
  HEART: 28,
  SWORD: 19,
  FROND: 0,
};

const MARKING_MIN_HALF_WIDTH = 12;
const STRIPE_FIRST_DISTANCE = 16;
const STRIPE_SPACING = 17;
const STRIPE_REACH = 0.88;
const STRIPE_WIDTH_RATIO = 0.65;
const STRIPE_TAPER = 0.8;
const STRIPE_PEAK = 7;
const VEIN_BASE = 4;
const VEIN_REACH = 0.92;
const VEIN_BRANCH_POSITIONS = [0.3, 0.5, 0.7] as const;
const VEIN_BRANCH_WIDTH_RATIO = 0.62;
const VEIN_BRANCH_RISE = 12;

function buildStripes(shape: LeafShape): string {
  const length = LEAF_LENGTH[shape];
  const halfWidth = LEAF_HALF_WIDTH[shape];
  const bands: string[] = [];
  for (let y = STRIPE_FIRST_DISTANCE; y < length * STRIPE_REACH; y += STRIPE_SPACING) {
    const reach = halfWidth * STRIPE_WIDTH_RATIO * (1 - (STRIPE_TAPER * y) / length);
    bands.push(`M${round(-reach)} ${-y} L0 ${-(y + STRIPE_PEAK)} L${round(reach)} ${-y}`);
  }
  return bands.join(' ');
}

function buildVeins(shape: LeafShape): string {
  const length = LEAF_LENGTH[shape];
  const halfWidth = LEAF_HALF_WIDTH[shape];
  const branches = VEIN_BRANCH_POSITIONS.map((position) => {
    const y = -length * position;
    const reach = halfWidth * VEIN_BRANCH_WIDTH_RATIO * (1 - position * 0.5);
    return `M0 ${round(y)} L${round(-reach)} ${round(y - VEIN_BRANCH_RISE)} M0 ${round(y)} L${round(reach)} ${round(y - VEIN_BRANCH_RISE)}`;
  });
  return `M0 ${-VEIN_BASE} L0 ${round(-length * VEIN_REACH)} ${branches.join(' ')}`;
}

export function hasMarkings(shape: LeafShape): boolean {
  return LEAF_HALF_WIDTH[shape] >= MARKING_MIN_HALF_WIDTH;
}

export const STRIPE_PATHS: Record<LeafShape, string> = Object.fromEntries(
  (Object.keys(LEAF_PATHS) as LeafShape[]).map((shape) => [shape, buildStripes(shape)]),
) as Record<LeafShape, string>;

export const VEIN_PATHS: Record<LeafShape, string> = Object.fromEntries(
  (Object.keys(LEAF_PATHS) as LeafShape[]).map((shape) => [shape, buildVeins(shape)]),
) as Record<LeafShape, string>;

export const BLOOM_PATHS = {
  SPIKE: 'M0 0 C-17 -18 -19 -60 0 -100 C19 -60 17 -18 0 0 Z',
  SPIKE_RIBS:
    'M0 -8 L-11 -22 M0 -8 L11 -22 M0 -30 L-13 -46 M0 -30 L13 -46 M0 -52 L-11 -68 M0 -52 L11 -68 M0 -74 L-7 -86 M0 -74 L7 -86',
  PETAL: 'M0 0 C-13 -8 -13 -26 0 -32 C13 -26 13 -8 0 0 Z',
  SPATHE: 'M0 0 C-30 -14 -32 -52 0 -78 C32 -52 30 -14 0 0 Z',
  SPADIX: 'M0 -6 C-5 -6 -5 -34 0 -36 C5 -34 5 -6 0 -6 Z',
} as const;

export const FLOWER_PETAL_ANGLES = [0, 72, 144, 216, 288] as const;
export const SPIKE_SCALE = { x: 1.35, y: 1.15 } as const;
export const BLOOM_WILT_SCALE = 0.35;
export const SPATHE_TILT_DEGREES = 8;
