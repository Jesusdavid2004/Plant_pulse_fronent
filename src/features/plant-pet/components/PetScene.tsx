import type { ReactNode } from 'react';
import { sceneColorVars } from '../traitColors';
import type { SceneKey } from '../types';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 300;
const GROUND_Y = 214;
const STAR_POSITIONS = [
  { x: 40, y: 36 },
  { x: 92, y: 70 },
  { x: 150, y: 28 },
  { x: 214, y: 58 },
  { x: 276, y: 34 },
  { x: 250, y: 104 },
  { x: 62, y: 124 },
];
const FLOWER_POSITIONS = [
  { x: 36, y: 232 },
  { x: 84, y: 250 },
  { x: 244, y: 246 },
  { x: 288, y: 228 },
];

interface SceneArtProps {
  sky: string;
  ground: string;
  accent: string;
}

function Backdrop({
  sky,
  ground,
  children,
}: Pick<SceneArtProps, 'sky' | 'ground'> & { children?: ReactNode }) {
  return (
    <>
      <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={sky} />
      {children}
      <rect y={GROUND_Y} width={VIEW_WIDTH} height={VIEW_HEIGHT - GROUND_Y} fill={ground} />
    </>
  );
}

function LivingRoom({ sky, ground, accent }: SceneArtProps) {
  return (
    <Backdrop sky={sky} ground={ground}>
      <rect x={196} y={44} width={92} height={96} rx={6} fill={accent} />
      <path d="M242 44 V140 M196 92 H288" stroke="var(--color-pet-pot-shade)" strokeWidth={5} />
      <rect
        x={196}
        y={44}
        width={92}
        height={96}
        rx={6}
        fill="none"
        stroke="var(--color-pet-pot-shade)"
        strokeWidth={6}
      />
      <rect
        x={40}
        y={60}
        width={64}
        height={48}
        rx={4}
        fill="none"
        stroke="var(--color-pet-pot-shade)"
        strokeWidth={5}
      />
      <path d="M52 100 L68 78 L80 92 L92 74 L98 100 Z" fill="var(--color-pet-leaf)" opacity={0.7} />
      <ellipse cx={160} cy={262} rx={110} ry={22} fill="var(--color-pet-blush)" opacity={0.35} />
    </Backdrop>
  );
}

function Garden({ sky, ground, accent }: SceneArtProps) {
  return (
    <Backdrop sky={sky} ground={ground}>
      <ellipse cx={70} cy={56} rx={34} ry={13} fill="var(--color-surface)" opacity={0.85} />
      <ellipse cx={92} cy={50} rx={22} ry={11} fill="var(--color-surface)" opacity={0.85} />
      <ellipse cx={240} cy={86} rx={30} ry={11} fill="var(--color-surface)" opacity={0.7} />
      <path
        d={`M0 ${GROUND_Y} Q80 ${GROUND_Y - 34} 170 ${GROUND_Y - 6} T320 ${GROUND_Y - 22} V${GROUND_Y} Z`}
        fill={ground}
      />
      {[210, 236, 262, 288].map((x) => (
        <rect
          key={x}
          x={x}
          y={GROUND_Y - 36}
          width={10}
          height={44}
          rx={3}
          fill="var(--color-pet-pot-shade)"
        />
      ))}
      {FLOWER_POSITIONS.map((flower) => (
        <g key={`${flower.x}-${flower.y}`}>
          <path
            d={`M${flower.x} ${flower.y} v14`}
            stroke="var(--color-pet-stem)"
            strokeWidth={2.5}
          />
          <circle cx={flower.x} cy={flower.y} r={6} fill={accent} />
          <circle cx={flower.x} cy={flower.y} r={2.4} fill="var(--color-pet-sun)" />
        </g>
      ))}
    </Backdrop>
  );
}

function NightSky({ sky, ground, accent }: SceneArtProps) {
  return (
    <Backdrop sky={sky} ground={ground}>
      <circle cx={256} cy={56} r={22} fill={accent} />
      <circle cx={266} cy={50} r={20} fill={sky} />
      {STAR_POSITIONS.map((star, index) => (
        <circle
          key={`${star.x}-${star.y}`}
          cx={star.x}
          cy={star.y}
          r={index % 2 === 0 ? 2.4 : 1.8}
          fill={accent}
          className="pp-twinkle"
          style={{ animationDelay: `${index * 0.4}s` }}
        />
      ))}
    </Backdrop>
  );
}

function Beach({ sky, ground, accent }: SceneArtProps) {
  return (
    <Backdrop sky={sky} ground={ground}>
      <circle cx={256} cy={58} r={26} fill="var(--color-pet-sun)" />
      <rect y={150} width={VIEW_WIDTH} height={GROUND_Y - 150} fill={accent} />
      <path
        d="M0 168 Q20 160 40 168 T80 168 T120 168 T160 168 T200 168 T240 168 T280 168 T320 168"
        stroke="var(--color-surface)"
        strokeWidth={3}
        fill="none"
        opacity={0.7}
      />
    </Backdrop>
  );
}

function Greenhouse({ sky, ground, accent }: SceneArtProps) {
  return (
    <Backdrop sky={sky} ground={ground}>
      <path
        d="M0 70 H320 M0 140 H320 M80 0 V214 M160 0 V214 M240 0 V214"
        stroke={accent}
        strokeWidth={3}
        opacity={0.55}
      />
      {[40, 120, 200, 280].map((x, index) => (
        <g key={x}>
          <path d={`M${x} 0 V${28 + index * 6}`} stroke="var(--color-pet-stem)" strokeWidth={2} />
          <circle cx={x} cy={34 + index * 6} r={12} fill={accent} />
        </g>
      ))}
    </Backdrop>
  );
}

const SCENE_ART: Record<SceneKey, (props: SceneArtProps) => ReactNode> = {
  LIVING_ROOM: LivingRoom,
  GARDEN: Garden,
  NIGHT_SKY: NightSky,
  BEACH: Beach,
  GREENHOUSE: Greenhouse,
};

interface PetSceneProps {
  scene: SceneKey;
  children: ReactNode;
}

export function PetScene({ scene, children }: PetSceneProps) {
  const colors = sceneColorVars(scene);
  const Art = SCENE_ART[scene];

  return (
    <div className="relative overflow-hidden rounded-3xl" data-scene={scene}>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <Art {...colors} />
      </svg>
      <div className="relative p-4">{children}</div>
    </div>
  );
}
