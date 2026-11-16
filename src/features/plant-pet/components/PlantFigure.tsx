import type { LeafPattern, LeafShape, PetTraits } from '../../plants/types';
import {
  BLOOM_PATHS,
  BLOOM_WILT_SCALE,
  FLOWER_PETAL_ANGLES,
  FROND_RACHIS_PATH,
  hasMarkings,
  LEAF_PATHS,
  SPATHE_TILT_DEGREES,
  SPIKE_SCALE,
  STRIPE_PATHS,
  VEIN_PATHS,
} from '../leafGeometry';
import {
  BASE_X,
  buildPlantLayout,
  vineLeafScale,
  type BloomAnchor,
  type CactusBody,
  type LeafPose,
  type PlantLayout,
} from '../plantLayout';
import { bloomColorVar } from '../traitColors';

const STEM_WIDTH = 4;
const MARKING_OPACITY = 0.7;
const MARKING_WIDTH = 3;
const BLOOM_SWAY_RATIO = 0.4;
const BLOOM_DROOP_RATIO = 0.15;
const FLOWER_STEM_MIN = 8;
const FLOWER_CENTER_RADIUS = 7;
const SMALL_FLOWER_SCALE = 0.7;
const SPATHE_SCALE = 0.8;
const CANOPY_SWAY_RATIO = 0.4;
const CANOPY_DROOP_PX_PER_DEGREE = 0.4;
const CANOPY_SHINE_OPACITY = 0.14;
const CANOPY_SHINE_OFFSET = { x: -0.25, y: -0.3, radius: 0.55 } as const;
const TREE_FLOWER_RADIUS = 5.5;
const TREE_FLOWER_OFFSET = { x: 0.35, y: 0.2 } as const;
const CACTUS_SWAY_RATIO = 0.3;
const CACTUS_RIB_OPACITY = 0.16;
const CACTUS_RIBS = 'M109 94 V138 M120 86 V142 M131 94 V138';
const CACTUS_SPINES =
  'M109 104 l-6 -3 M109 120 l-6 -3 M131 104 l6 -3 M131 120 l6 -3 M120 98 l-4 -5 M120 118 l4 -5 M120 134 l-4 -4';
const CACTUS_SPINE_OPACITY = 0.5;
const VINE_SWAY_PX = 0.3;
const VINE_WIDTH = 3;

export interface PlantAngles {
  droop: number;
  sway: number;
}

interface LeafGraphicProps {
  shape: LeafShape;
  pattern: LeafPattern;
}

function LeafGraphic({ shape, pattern }: LeafGraphicProps) {
  if (shape === 'FROND') {
    return (
      <>
        <path d={LEAF_PATHS.FROND} fill="currentColor" />
        <path
          d={FROND_RACHIS_PATH}
          stroke="var(--color-pet-stem)"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </>
    );
  }

  const markings =
    pattern === 'STRIPED' ? STRIPE_PATHS[shape] : pattern === 'VEINED' ? VEIN_PATHS[shape] : null;
  return (
    <>
      <path d={LEAF_PATHS[shape]} fill="currentColor" style={{ transition: 'fill 0.8s ease' }} />
      {markings && hasMarkings(shape) && (
        <path
          d={markings}
          stroke="var(--color-plant-marking)"
          strokeOpacity={MARKING_OPACITY}
          strokeWidth={MARKING_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </>
  );
}

interface LeafProps {
  pose: LeafPose;
  pattern: LeafPattern;
  angles: PlantAngles;
}

function Leaf({ pose, pattern, angles }: LeafProps) {
  const rotation = pose.angle + angles.droop * pose.droopRatio + angles.sway * pose.swayRatio;
  const tilt = pose.mirror ? -pose.leafTilt : pose.leafTilt;
  return (
    <g
      transform={`translate(${pose.x} ${pose.y}) rotate(${rotation}) scale(${pose.mirror ? -1 : 1} 1)`}
    >
      {pose.stem > 0 && (
        <path
          d={`M0 0 L0 ${-pose.stem}`}
          stroke="var(--color-pet-stem)"
          strokeWidth={STEM_WIDTH}
          strokeLinecap="round"
        />
      )}
      <g transform={`translate(0 ${-pose.stem}) rotate(${tilt}) scale(${pose.scale})`}>
        <LeafGraphic shape={pose.shape} pattern={pattern} />
      </g>
    </g>
  );
}

interface BloomProps {
  anchor: BloomAnchor;
  color: string;
  angles: PlantAngles;
  wilted: boolean;
}

function Bloom({ anchor, color, angles, wilted }: BloomProps) {
  const opacity = wilted ? 1 - BLOOM_WILT_SCALE : 1;
  const lean = angles.droop * BLOOM_DROOP_RATIO + angles.sway * BLOOM_SWAY_RATIO;
  const placement = `translate(${anchor.x} ${anchor.y}) rotate(${lean})`;

  if (anchor.shape === 'SPIKE') {
    return (
      <g transform={`${placement} scale(${SPIKE_SCALE.x} ${SPIKE_SCALE.y})`} opacity={opacity}>
        <path d={BLOOM_PATHS.SPIKE} fill={color} />
        <path
          d={BLOOM_PATHS.SPIKE_RIBS}
          stroke="var(--color-pet-ink)"
          strokeOpacity={0.28}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    );
  }

  const hasStem = anchor.stemHeight > FLOWER_STEM_MIN;
  return (
    <g transform={placement} opacity={opacity}>
      {hasStem && (
        <path
          d={`M0 0 L0 ${-anchor.stemHeight}`}
          stroke="var(--color-pet-stem)"
          strokeWidth={STEM_WIDTH}
          strokeLinecap="round"
        />
      )}
      <g transform={`translate(0 ${-anchor.stemHeight})`}>
        {anchor.shape === 'SPATHE' ? (
          <g transform={`rotate(${SPATHE_TILT_DEGREES}) scale(${SPATHE_SCALE})`}>
            <path d={BLOOM_PATHS.SPATHE} fill={color} />
            <path d={BLOOM_PATHS.SPADIX} fill="var(--color-pet-sun)" />
          </g>
        ) : (
          <g transform={hasStem ? undefined : `scale(${SMALL_FLOWER_SCALE})`}>
            {FLOWER_PETAL_ANGLES.map((angle) => (
              <path key={angle} d={BLOOM_PATHS.PETAL} fill={color} transform={`rotate(${angle})`} />
            ))}
            <circle r={FLOWER_CENTER_RADIUS} fill="var(--color-pet-sun)" />
          </g>
        )}
      </g>
    </g>
  );
}

interface CanopyProps {
  layout: PlantLayout;
  traits: PetTraits;
  angles: PlantAngles;
  wilted: boolean;
}

function Canopy({ layout, traits, angles, wilted }: CanopyProps) {
  if (!layout.canopy) return null;
  const { blobs, pivotY } = layout.canopy;
  const flowers = traits.bloomShape !== 'NONE';
  const bloomOpacity = wilted ? 1 - BLOOM_WILT_SCALE : 1;
  return (
    <g
      transform={`translate(0 ${angles.droop * CANOPY_DROOP_PX_PER_DEGREE}) rotate(${angles.sway * CANOPY_SWAY_RATIO} ${BASE_X} ${pivotY})`}
    >
      {blobs.map((blob) => (
        <circle
          key={`${blob.x}-${blob.y}`}
          cx={blob.x}
          cy={blob.y}
          r={blob.radius}
          fill="currentColor"
          style={{ transition: 'fill 0.8s ease' }}
        />
      ))}
      {blobs.map((blob) => (
        <circle
          key={`shine-${blob.x}-${blob.y}`}
          cx={blob.x + blob.radius * CANOPY_SHINE_OFFSET.x}
          cy={blob.y + blob.radius * CANOPY_SHINE_OFFSET.y}
          r={blob.radius * CANOPY_SHINE_OFFSET.radius}
          fill="var(--color-plant-marking)"
          opacity={CANOPY_SHINE_OPACITY}
        />
      ))}
      {flowers &&
        blobs.map((blob, index) => (
          <circle
            key={`flower-${blob.x}-${blob.y}`}
            cx={blob.x + (index % 2 === 0 ? -1 : 1) * blob.radius * TREE_FLOWER_OFFSET.x}
            cy={blob.y + blob.radius * TREE_FLOWER_OFFSET.y}
            r={TREE_FLOWER_RADIUS}
            fill={bloomColorVar(traits.bloomColor)}
            opacity={bloomOpacity}
          />
        ))}
    </g>
  );
}

function Cactus({ body, angles }: { body: CactusBody; angles: PlantAngles }) {
  const topCenter = body.topY + body.width / 2;
  return (
    <g transform={`rotate(${angles.sway * CACTUS_SWAY_RATIO} ${BASE_X} ${body.bottomY})`}>
      {body.armPaths.map((path) => (
        <path
          key={path}
          d={path}
          stroke="currentColor"
          strokeWidth={body.armWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
      <path
        d={`M${BASE_X} ${body.bottomY} V${topCenter}`}
        stroke="currentColor"
        strokeWidth={body.width}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={CACTUS_RIBS}
        stroke="var(--color-pet-ink)"
        strokeOpacity={CACTUS_RIB_OPACITY}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={CACTUS_SPINES}
        stroke="var(--color-plant-marking)"
        strokeOpacity={CACTUS_SPINE_OPACITY}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

interface PlantFigureProps {
  traits: PetTraits;
  angles: PlantAngles;
  wilted?: boolean;
}

export function PlantFigure({ traits, angles, wilted = false }: PlantFigureProps) {
  const layout = buildPlantLayout(traits);
  return (
    <g>
      {layout.trunk && (
        <path
          d={layout.trunk.path}
          stroke="var(--color-pet-stem)"
          strokeWidth={layout.trunk.width}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {layout.cactus && <Cactus body={layout.cactus} angles={angles} />}
      <Canopy layout={layout} traits={traits} angles={angles} wilted={wilted} />
      {layout.bloom && (
        <Bloom
          anchor={layout.bloom}
          color={bloomColorVar(traits.bloomColor)}
          angles={angles}
          wilted={wilted}
        />
      )}
      {layout.leaves.map((pose) => (
        <Leaf key={pose.key} pose={pose} pattern={traits.leafPattern} angles={angles} />
      ))}
    </g>
  );
}

export function PlantVines({ traits, angles }: Omit<PlantFigureProps, 'wilted'>) {
  const layout = buildPlantLayout(traits);
  if (layout.vines.length === 0) return null;
  const scale = vineLeafScale(traits.leafShape);
  return (
    <g transform={`translate(${angles.sway * VINE_SWAY_PX} 0)`}>
      {layout.vines.map((vine) => (
        <g key={vine.path}>
          <path
            d={vine.path}
            stroke="var(--color-pet-stem)"
            strokeWidth={VINE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
          {vine.leaves.map((leaf) => (
            <g
              key={`${leaf.x}-${leaf.y}`}
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${scale})`}
            >
              <LeafGraphic shape={traits.leafShape} pattern="PLAIN" />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}
