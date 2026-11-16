import type { BloomShape, GrowthForm, LeafShape, PetTraits } from '../plants/types';
import { LEAF_LENGTH } from './leafGeometry';

export const BASE_X = 120;
export const RIM_Y = 146;

export interface LeafPose {
  key: number;
  x: number;
  y: number;
  angle: number;
  droopRatio: number;
  swayRatio: number;
  mirror: boolean;
  scale: number;
  stem: number;
  leafTilt: number;
  shape: LeafShape;
}

export interface BloomAnchor {
  x: number;
  y: number;
  stemHeight: number;
  shape: BloomShape;
}

export interface CanopyBlob {
  x: number;
  y: number;
  radius: number;
}

export interface VineLeaf {
  x: number;
  y: number;
  angle: number;
}

export interface Vine {
  path: string;
  leaves: VineLeaf[];
}

export interface CactusBody {
  topY: number;
  bottomY: number;
  width: number;
  armPaths: string[];
  armWidth: number;
}

export interface PlantLayout {
  form: GrowthForm;
  leaves: LeafPose[];
  trunk: { path: string; width: number } | null;
  canopy: { blobs: CanopyBlob[]; pivotY: number } | null;
  cactus: CactusBody | null;
  vines: Vine[];
  bloom: BloomAnchor | null;
}

const MIN_LEAVES = 3;

const ROSETTE_BASE_SPREAD_DEGREES = 52;
const ROSETTE_SPREAD_GROWTH_PER_EXTRA_LEAF = 6;
const ROSETTE_MAX_SPREAD_DEGREES = 78;
const ROSETTE_SCALE_LOSS_PER_EXTRA_LEAF = 0.05;
const ROSETTE_MIN_SCALE = 0.7;
const ROSETTE_DROOP_BASE_RATIO = 0.35;
const ROSETTE_DROOP_EDGE_RATIO = 0.65;
const ROSETTE_CENTER_DROOP_RATIO = 0.3;
const ROSETTE_CENTER_Y = 114;
const ROSETTE_TRUNK = 'M120 148 L120 110';
const ROSETTE_TRUNK_WIDTH = 8;
const ROSETTE_BLOOM_STEM = 74;

const UPRIGHT_MAX_BLADES = 10;
const UPRIGHT_SPREAD_PX = 30;
const UPRIGHT_LEAN_DEGREES = 20;
const UPRIGHT_HEIGHT = 150;
const UPRIGHT_EDGE_HEIGHT_LOSS = 40;
const UPRIGHT_STAGGER = 14;
const UPRIGHT_MAX_SCALE = 1.35;
const UPRIGHT_MIN_SCALE = 0.5;
const UPRIGHT_BLADE_SHAPES: readonly LeafShape[] = ['SWORD', 'LONG', 'SPIKY', 'GRASS', 'POINTED'];
const UPRIGHT_BLOOM_STEM = 130;

const STALKED_MAX_LEAVES = 8;
const STALKED_SPREAD_PX = 10;
const STALKED_ANGLE_DEGREES = 44;
const STALKED_SHORTEST_STEM = 46;
const STALKED_STEM_GAIN = 34;
const STALKED_LEAF_LENGTH = 74;
const STALKED_MAX_SCALE = 1.1;
const STALKED_MIN_SCALE = 0.6;
const STALKED_SCALE_LOSS_PER_EXTRA_LEAF = 0.03;
const STALKED_TILT_DEGREES = 18;
const STALKED_BLOOM_STEM = 104;

const BUSHY_EXTRA_LEAVES = 6;
const BUSHY_MAX_LEAVES = 18;
const BUSHY_SPREAD_PX = 22;
const BUSHY_ANGLE_DEGREES = 62;
const BUSHY_LEAF_LENGTH = 54;
const BUSHY_BACK_STEM = 40;
const BUSHY_FRONT_STEM = 20;
const BUSHY_MAX_SCALE = 1;
const BUSHY_MIN_SCALE = 0.4;
const BUSHY_TILT_DEGREES = 24;
const BUSHY_BLOOM_STEM = 80;

const TRAILING_EXTRA_LEAVES = 3;
const TRAILING_MAX_LEAVES = 12;
const TRAILING_LEAF_LENGTH = 46;
const TRAILING_DOUBLE_VINE_LEAVES = 6;
const TRAILING_VINE_LEAF_LENGTH = 24;
const VINE_LEAF_POSITIONS = [0.3, 0.5, 0.7, 0.9] as const;
const VINE_LEAF_ANGLE_DEGREES = 62;
const VINE_MIRROR_AXIS = 240;
const VINES_LEFT = [
  { start: [62, 152], control: [34, 190], end: [46, 236] },
  { start: [70, 156], control: [46, 206], end: [60, 244] },
] as const;

const PALM_MIN_FRONDS = 5;
const PALM_MAX_FRONDS = 9;
const PALM_SPREAD_PX = 8;
const PALM_ANGLE_DEGREES = 66;
const PALM_SHORTEST_STEM = 30;
const PALM_STEM_GAIN = 16;
const PALM_CENTER_LENGTH = 104;
const PALM_EDGE_LENGTH_LOSS = 20;
const PALM_DROOP_BASE_RATIO = 0.5;
const PALM_DROOP_EDGE_RATIO = 0.8;
const PALM_BLOOM_STEM = 100;
const FROND_UNIT_LENGTH = LEAF_LENGTH.FROND;

const TREE_TRUNK = 'M120 148 C117 128 124 110 120 86';
const TREE_TRUNK_WIDTH = 11;
const TREE_CROWN_X = 120;
const TREE_CROWN_Y = 62;
const TREE_PIVOT_Y = 88;
const TREE_CORE_BLOBS: readonly CanopyBlob[] = [
  { x: 0, y: 0, radius: 32 },
  { x: -30, y: 14, radius: 26 },
  { x: 30, y: 14, radius: 26 },
  { x: -16, y: -22, radius: 24 },
  { x: 16, y: -22, radius: 24 },
];
const TREE_WIDE_BLOBS: readonly CanopyBlob[] = [
  { x: -46, y: -2, radius: 20 },
  { x: 46, y: -2, radius: 20 },
];
const TREE_TOP_BLOB: CanopyBlob = { x: 0, y: -42, radius: 18 };
const TREE_WIDE_FROM_LEAVES = 6;
const TREE_TOP_FROM_LEAVES = 9;

const CACTUS_BODY: Omit<CactusBody, 'armPaths'> = {
  topY: 78,
  bottomY: 148,
  width: 44,
  armWidth: 20,
};
const CACTUS_ARMS = ['M120 126 H90 V98', 'M120 112 H150 V86'] as const;
const CACTUS_ONE_ARM_FROM_LEAVES = 5;
const CACTUS_TWO_ARMS_FROM_LEAVES = 8;
const CACTUS_BLOOM_Y = 72;
const CACTUS_BLOOM_STEM = 4;

const SPIKE_FORMS: readonly GrowthForm[] = ['ROSETTE', 'UPRIGHT'];

function position(index: number, count: number): number {
  return count === 1 ? 0 : (index / (count - 1)) * 2 - 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function emptyLayout(form: GrowthForm): PlantLayout {
  return { form, leaves: [], trunk: null, canopy: null, cactus: null, vines: [], bloom: null };
}

export function leafScale(leafCount: number): number {
  return Math.max(
    ROSETTE_MIN_SCALE,
    1 - (leafCount - MIN_LEAVES) * ROSETTE_SCALE_LOSS_PER_EXTRA_LEAF,
  );
}

function effectiveBloomShape(form: GrowthForm, shape: BloomShape): BloomShape {
  if (shape === 'NONE') return shape;
  if (form === 'CACTUS' || form === 'TREE') return 'FLOWER';
  if (shape === 'SPIKE' && !SPIKE_FORMS.includes(form)) return 'FLOWER';
  return shape;
}

function layoutRosette(traits: PetTraits): PlantLayout {
  const count = Math.max(MIN_LEAVES, traits.leafCount);
  const spread = Math.min(
    ROSETTE_MAX_SPREAD_DEGREES,
    ROSETTE_BASE_SPREAD_DEGREES + (count - MIN_LEAVES) * ROSETTE_SPREAD_GROWTH_PER_EXTRA_LEAF,
  );
  const scale = leafScale(count);

  const leaves = Array.from({ length: count }, (_, index): LeafPose => {
    const place = position(index, count);
    const edgeness = Math.abs(place);
    const direction = Math.sign(place);
    const isCenter = direction === 0;
    return {
      key: index,
      x: BASE_X,
      y: ROSETTE_CENTER_Y,
      angle: place * spread,
      droopRatio: isCenter
        ? ROSETTE_CENTER_DROOP_RATIO
        : direction * (ROSETTE_DROOP_BASE_RATIO + ROSETTE_DROOP_EDGE_RATIO * edgeness),
      swayRatio: isCenter ? 0.5 : 0.6 + 0.4 * edgeness,
      mirror: direction < 0,
      scale,
      stem: 0,
      leafTilt: 0,
      shape: traits.leafShape,
    };
  });

  return {
    ...emptyLayout('ROSETTE'),
    leaves,
    trunk: { path: ROSETTE_TRUNK, width: ROSETTE_TRUNK_WIDTH },
    bloom: {
      x: BASE_X,
      y: ROSETTE_CENTER_Y,
      stemHeight: ROSETTE_BLOOM_STEM,
      shape: traits.bloomShape,
    },
  };
}

function layoutUpright(traits: PetTraits): PlantLayout {
  const count = Math.min(traits.leafCount, UPRIGHT_MAX_BLADES);
  const shape = UPRIGHT_BLADE_SHAPES.includes(traits.leafShape) ? traits.leafShape : 'SWORD';

  const leaves = Array.from({ length: count }, (_, index): LeafPose => {
    const place = position(index, count);
    const edgeness = Math.abs(place);
    const height =
      UPRIGHT_HEIGHT - UPRIGHT_EDGE_HEIGHT_LOSS * edgeness - (index % 2) * UPRIGHT_STAGGER;
    return {
      key: index,
      x: BASE_X + place * UPRIGHT_SPREAD_PX,
      y: RIM_Y,
      angle: place * UPRIGHT_LEAN_DEGREES,
      droopRatio: Math.sign(place) * (0.15 + 0.35 * edgeness),
      swayRatio: 0.4 + 0.5 * edgeness,
      mirror: place < 0,
      scale: clamp(height / LEAF_LENGTH[shape], UPRIGHT_MIN_SCALE, UPRIGHT_MAX_SCALE),
      stem: 0,
      leafTilt: 0,
      shape,
    };
  });

  return {
    ...emptyLayout('UPRIGHT'),
    leaves: byDistanceFromCenter(leaves),
    bloom: { x: BASE_X, y: RIM_Y - 4, stemHeight: UPRIGHT_BLOOM_STEM, shape: traits.bloomShape },
  };
}

function byDistanceFromCenter(leaves: LeafPose[]): LeafPose[] {
  return [...leaves].sort((a, b) => Math.abs(b.angle) - Math.abs(a.angle));
}

function layoutStalked(traits: PetTraits): PlantLayout {
  const count = Math.min(traits.leafCount, STALKED_MAX_LEAVES);
  const baseScale = clamp(
    (STALKED_LEAF_LENGTH / LEAF_LENGTH[traits.leafShape]) *
      (1 - (count - MIN_LEAVES) * STALKED_SCALE_LOSS_PER_EXTRA_LEAF),
    STALKED_MIN_SCALE,
    STALKED_MAX_SCALE,
  );

  const leaves = Array.from({ length: count }, (_, index): LeafPose => {
    const place = position(index, count);
    const edgeness = Math.abs(place);
    return {
      key: index,
      x: BASE_X + place * STALKED_SPREAD_PX,
      y: RIM_Y,
      angle: place * STALKED_ANGLE_DEGREES,
      droopRatio: Math.sign(place) * (0.3 + 0.5 * edgeness),
      swayRatio: 0.5 + 0.5 * edgeness,
      mirror: place < 0,
      scale: baseScale,
      stem: STALKED_SHORTEST_STEM + (1 - edgeness) * STALKED_STEM_GAIN,
      leafTilt: place * STALKED_TILT_DEGREES,
      shape: traits.leafShape,
    };
  });

  return {
    ...emptyLayout('STALKED'),
    leaves: byDistanceFromCenter(leaves),
    bloom: { x: BASE_X, y: RIM_Y - 4, stemHeight: STALKED_BLOOM_STEM, shape: traits.bloomShape },
  };
}

function layoutMound(count: number, leafLength: number, shape: LeafShape): LeafPose[] {
  const scale = clamp(leafLength / LEAF_LENGTH[shape], BUSHY_MIN_SCALE, BUSHY_MAX_SCALE);
  const leaves = Array.from({ length: count }, (_, index): LeafPose => {
    const place = position(index, count);
    const edgeness = Math.abs(place);
    const isFront = index % 2 === 1;
    return {
      key: index,
      x: BASE_X + place * BUSHY_SPREAD_PX,
      y: RIM_Y,
      angle: place * BUSHY_ANGLE_DEGREES,
      droopRatio: Math.sign(place) * (0.4 + 0.6 * edgeness),
      swayRatio: 0.6 + 0.4 * edgeness,
      mirror: place < 0,
      scale,
      stem: isFront ? BUSHY_FRONT_STEM : BUSHY_BACK_STEM,
      leafTilt: place * BUSHY_TILT_DEGREES,
      shape,
    };
  });
  return [...leaves].sort((a, b) => b.stem - a.stem);
}

function layoutBushy(traits: PetTraits): PlantLayout {
  const count = Math.min(traits.leafCount + BUSHY_EXTRA_LEAVES, BUSHY_MAX_LEAVES);
  return {
    ...emptyLayout('BUSHY'),
    leaves: layoutMound(count, BUSHY_LEAF_LENGTH, traits.leafShape),
    bloom: { x: BASE_X, y: RIM_Y - 30, stemHeight: BUSHY_BLOOM_STEM, shape: traits.bloomShape },
  };
}

function quadraticPoint(
  start: readonly [number, number],
  control: readonly [number, number],
  end: readonly [number, number],
  t: number,
): { x: number; y: number; angle: number } {
  const inverse = 1 - t;
  const x = inverse * inverse * start[0] + 2 * inverse * t * control[0] + t * t * end[0];
  const y = inverse * inverse * start[1] + 2 * inverse * t * control[1] + t * t * end[1];
  const dx = 2 * inverse * (control[0] - start[0]) + 2 * t * (end[0] - control[0]);
  const dy = 2 * inverse * (control[1] - start[1]) + 2 * t * (end[1] - control[1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

function buildVine(spec: (typeof VINES_LEFT)[number], mirror: boolean): Vine {
  const flip = (point: readonly [number, number]): [number, number] => [
    mirror ? VINE_MIRROR_AXIS - point[0] : point[0],
    point[1],
  ];
  const [start, control, end] = [flip(spec.start), flip(spec.control), flip(spec.end)];
  const leaves = VINE_LEAF_POSITIONS.map((t, index): VineLeaf => {
    const point = quadraticPoint(start, control, end, t);
    const outward = (index % 2 === 0 ? -1 : 1) * (mirror ? -1 : 1);
    return { x: point.x, y: point.y, angle: point.angle + 90 + outward * VINE_LEAF_ANGLE_DEGREES };
  });
  return {
    path: `M${start[0]} ${start[1]} Q${control[0]} ${control[1]} ${end[0]} ${end[1]}`,
    leaves,
  };
}

function layoutTrailing(traits: PetTraits): PlantLayout {
  const count = Math.min(traits.leafCount + TRAILING_EXTRA_LEAVES, TRAILING_MAX_LEAVES);
  const specs =
    traits.leafCount >= TRAILING_DOUBLE_VINE_LEAVES ? VINES_LEFT : VINES_LEFT.slice(0, 1);
  const vines = specs.flatMap((spec) => [buildVine(spec, false), buildVine(spec, true)]);
  return {
    ...emptyLayout('TRAILING'),
    leaves: layoutMound(count, TRAILING_LEAF_LENGTH, traits.leafShape),
    vines,
    bloom: { x: BASE_X, y: RIM_Y - 30, stemHeight: BUSHY_BLOOM_STEM, shape: traits.bloomShape },
  };
}

function layoutPalm(traits: PetTraits): PlantLayout {
  const count = clamp(traits.leafCount, PALM_MIN_FRONDS, PALM_MAX_FRONDS);
  const leaves = Array.from({ length: count }, (_, index): LeafPose => {
    const place = position(index, count);
    const edgeness = Math.abs(place);
    return {
      key: index,
      x: BASE_X + place * PALM_SPREAD_PX,
      y: RIM_Y,
      angle: place * PALM_ANGLE_DEGREES,
      droopRatio: Math.sign(place) * (PALM_DROOP_BASE_RATIO + PALM_DROOP_EDGE_RATIO * edgeness),
      swayRatio: 0.5 + 0.5 * edgeness,
      mirror: place < 0,
      scale: (PALM_CENTER_LENGTH - PALM_EDGE_LENGTH_LOSS * edgeness) / FROND_UNIT_LENGTH,
      stem: PALM_SHORTEST_STEM + (1 - edgeness) * PALM_STEM_GAIN,
      leafTilt: 0,
      shape: 'FROND',
    };
  });

  return {
    ...emptyLayout('PALM'),
    leaves: byDistanceFromCenter(leaves),
    bloom: { x: BASE_X, y: RIM_Y - 10, stemHeight: PALM_BLOOM_STEM, shape: traits.bloomShape },
  };
}

function layoutTree(traits: PetTraits): PlantLayout {
  const blobs = [
    ...TREE_CORE_BLOBS,
    ...(traits.leafCount >= TREE_WIDE_FROM_LEAVES ? TREE_WIDE_BLOBS : []),
    ...(traits.leafCount >= TREE_TOP_FROM_LEAVES ? [TREE_TOP_BLOB] : []),
  ].map((blob) => ({ ...blob, x: blob.x + TREE_CROWN_X, y: blob.y + TREE_CROWN_Y }));

  return {
    ...emptyLayout('TREE'),
    trunk: { path: TREE_TRUNK, width: TREE_TRUNK_WIDTH },
    canopy: { blobs, pivotY: TREE_PIVOT_Y },
  };
}

function layoutCactus(traits: PetTraits): PlantLayout {
  const armCount =
    traits.leafCount >= CACTUS_TWO_ARMS_FROM_LEAVES
      ? 2
      : traits.leafCount >= CACTUS_ONE_ARM_FROM_LEAVES
        ? 1
        : 0;
  return {
    ...emptyLayout('CACTUS'),
    cactus: { ...CACTUS_BODY, armPaths: CACTUS_ARMS.slice(0, armCount) },
    bloom: {
      x: BASE_X,
      y: CACTUS_BLOOM_Y,
      stemHeight: CACTUS_BLOOM_STEM,
      shape: traits.bloomShape,
    },
  };
}

export function buildPlantLayout(traits: PetTraits): PlantLayout {
  const layouts: Record<GrowthForm, (traits: PetTraits) => PlantLayout> = {
    ROSETTE: layoutRosette,
    UPRIGHT: layoutUpright,
    STALKED: layoutStalked,
    BUSHY: layoutBushy,
    TRAILING: layoutTrailing,
    PALM: layoutPalm,
    TREE: layoutTree,
    CACTUS: layoutCactus,
  };
  const layout = layouts[traits.growthForm](traits);
  const bloomShape = effectiveBloomShape(traits.growthForm, traits.bloomShape);
  return {
    ...layout,
    bloom: layout.bloom && bloomShape !== 'NONE' ? { ...layout.bloom, shape: bloomShape } : null,
  };
}

export function vineLeafScale(shape: LeafShape): number {
  return TRAILING_VINE_LEAF_LENGTH / LEAF_LENGTH[shape];
}
