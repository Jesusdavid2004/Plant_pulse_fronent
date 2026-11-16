import { useRef, useState } from 'react';
import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { useBlink } from '../hooks/useBlink';
import { usePetMotion } from '../hooks/usePetMotion';
import { MOOD_PRESENTATION, type EyeStyle, type MouthStyle } from '../moodPresentation';
import type { CareType, Mood, PotKey } from '../types';
import type { PetTraits } from '../../plants/types';
import {
  BLOOM_PATHS,
  BLOOM_WILT_SCALE,
  buildLeafPoses,
  DEFAULT_PET_TRAITS,
  FLOWER_HEIGHT,
  FLOWER_PETAL_ANGLES,
  SPIKE_SCALE,
  LEAF_PATHS,
  leafScale,
} from '../leafGeometry';
import { blendLeafColor, bloomColorVar, potColorVars } from '../traitColors';

const BOUNCE_HEIGHT_PX = -16;
const BOUNCE_DURATION_S = 0.5;
const BREATH_SCALE = 1.025;
const BREATH_DURATION_S = 3.4;
const RAIN_DROPS = [92, 112, 132, 152];
const SPARKLE_POSITIONS = [
  { x: 52, y: 62 },
  { x: 190, y: 82 },
  { x: 168, y: 36 },
];

const MOUTH_PATHS: Record<MouthStyle, string> = {
  smile: 'M104 206 Q120 224 136 206',
  flat: 'M108 212 H132',
  frown: 'M106 218 Q120 202 134 218',
  wobbly: 'M104 214 Q112 206 120 214 T136 214',
};

const EYE_CENTERS = [100, 140];
const EYE_Y = 186;

interface EyesProps {
  style: EyeStyle;
  closed: boolean;
}

function Eyes({ style, closed }: EyesProps) {
  if (style === 'dizzy') {
    return (
      <g stroke="var(--color-pet-ink)" strokeWidth={3} strokeLinecap="round" fill="none">
        {EYE_CENTERS.map((cx) => (
          <path key={cx} d={`M${cx - 6} ${EYE_Y - 6} l12 12 M${cx + 6} ${EYE_Y - 6} l-12 12`} />
        ))}
      </g>
    );
  }

  if (closed || style === 'squint') {
    return (
      <g stroke="var(--color-pet-ink)" strokeWidth={3} strokeLinecap="round" fill="none">
        {EYE_CENTERS.map((cx) => (
          <path key={cx} d={`M${cx - 7} ${EYE_Y} Q${cx} ${EYE_Y - 6} ${cx + 7} ${EYE_Y}`} />
        ))}
      </g>
    );
  }

  const radiusY = style === 'tired' ? 3.5 : 6;
  return (
    <g>
      {EYE_CENTERS.map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={EYE_Y} rx={6} ry={radiusY} fill="var(--color-pet-ink)" />
          <circle cx={cx + 2} cy={EYE_Y - 2} r={1.8} fill="var(--color-surface)" />
        </g>
      ))}
      {style === 'sad' && (
        <g stroke="var(--color-pet-ink)" strokeWidth={2.5} strokeLinecap="round">
          <path d="M92 174 L106 170" />
          <path d="M148 174 L134 170" />
        </g>
      )}
    </g>
  );
}

function WaterDrop({ x, delay }: { x: number; delay: number }) {
  return (
    <motion.path
      d={`M${x} 20 C${x - 6} 32 ${x - 6} 38 ${x} 38 C${x + 6} 38 ${x + 6} 32 ${x} 20 Z`}
      fill="var(--color-pet-water)"
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: [0, 110], opacity: [0, 1, 0] }}
      transition={{ duration: 1.1, delay, repeat: 1, ease: 'easeIn' }}
    />
  );
}

function SunGlow() {
  return (
    <motion.circle
      cx={120}
      cy={90}
      r={70}
      fill="var(--color-pet-sun)"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.35, 0] }}
      transition={{ duration: 1.6 }}
    />
  );
}

function SparkleBurst({ positions }: { positions: { x: number; y: number }[] }) {
  return (
    <>
      {positions.map((position, index) => (
        <motion.path
          key={`${position.x}-${position.y}`}
          d={`M${position.x} ${position.y - 8} L${position.x + 2.5} ${position.y - 2.5} L${position.x + 8} ${position.y} L${position.x + 2.5} ${position.y + 2.5} L${position.x} ${position.y + 8} L${position.x - 2.5} ${position.y + 2.5} L${position.x - 8} ${position.y} L${position.x - 2.5} ${position.y - 2.5} Z`}
          fill="var(--color-pet-sparkle)"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, delay: index * 0.3, repeat: Infinity }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ))}
    </>
  );
}

interface BloomProps {
  traits: PetTraits;
  wiltDegrees: number;
  sway: number;
  wilted: boolean;
}

function Bloom({ traits, wiltDegrees, sway, wilted }: BloomProps) {
  if (traits.bloomShape === 'NONE') return null;
  const color = bloomColorVar(traits.bloomColor);
  const opacity = wilted ? 1 - BLOOM_WILT_SCALE : 1;

  if (traits.bloomShape === 'SPIKE') {
    return (
      <g
        transform={`rotate(${wiltDegrees + sway * 0.4}) scale(${SPIKE_SCALE.x} ${SPIKE_SCALE.y})`}
        opacity={opacity}
      >
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

  return (
    <g transform={`rotate(${wiltDegrees + sway * 0.4})`} opacity={opacity}>
      <path d={`M0 0 L0 ${-FLOWER_HEIGHT}`} stroke="var(--color-pet-stem)" strokeWidth={4} />
      <g transform={`translate(0 ${-FLOWER_HEIGHT})`}>
        {FLOWER_PETAL_ANGLES.map((angle) => (
          <path key={angle} d={BLOOM_PATHS.PETAL} fill={color} transform={`rotate(${angle})`} />
        ))}
        <circle r={7} fill="var(--color-pet-sun)" />
      </g>
    </g>
  );
}

const HEART_BASE_X = 88;
const HEART_X_SPREAD = 64;
const HEART_X_STEP = 37;
const MAX_HEARTS = 4;

function FloatingHeart({ id, onDone }: { id: number; onDone: (id: number) => void }) {
  const x = HEART_BASE_X + ((id * HEART_X_STEP) % HEART_X_SPREAD);
  return (
    <motion.path
      d={`M${x} 118 C${x - 10} 108 ${x - 9} 98 ${x} 100 C${x + 9} 98 ${x + 10} 108 ${x} 118 Z`}
      fill="var(--color-plant-bloom-red)"
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -70, opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      onAnimationComplete={() => onDone(id)}
    />
  );
}

export interface PlantPetCharacterProps {
  mood: Mood;
  effect: CareType | null;
  urgentNeed: CareType | null;
  label: string;
  traits?: PetTraits;
  pot?: PotKey;
  interactive?: boolean;
}

export function PlantPetCharacter({
  mood,
  effect,
  urgentNeed,
  label,
  traits = DEFAULT_PET_TRAITS,
  pot = 'TERRACOTTA',
  interactive = true,
}: PlantPetCharacterProps) {
  const presentation = MOOD_PRESENTATION[mood];
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  const eyesClosed = useBlink(!reduceMotion && presentation.eyeStyle !== 'dizzy');
  const angles = usePetMotion({
    droopDegrees: presentation.leafDroopDegrees,
    swayAmplitudeDegrees: presentation.swayAmplitudeDegrees,
    swaySpeed: presentation.swaySpeed,
  });

  const eyeStyle: EyeStyle =
    urgentNeed === 'SUN' && presentation.eyeStyle !== 'dizzy' && mood !== 'HAPPY'
      ? 'squint'
      : presentation.eyeStyle;

  const [hearts, setHearts] = useState<number[]>([]);
  const nextHeartId = useRef(0);
  const dropHeart = (id: number) => setHearts((current) => current.filter((heart) => heart !== id));

  const bounce = () => {
    if (reduceMotion) return;
    nextHeartId.current += 1;
    const id = nextHeartId.current;
    setHearts((current) => [...current.slice(-(MAX_HEARTS - 1)), id]);
    void animate(scope.current, { y: [0, BOUNCE_HEIGHT_PX, 0] }, { duration: BOUNCE_DURATION_S });
  };

  const potVars = potColorVars(pot);
  const leafPoses = buildLeafPoses(traits.leafCount);
  const scale = leafScale(traits.leafCount);
  const Wrapper = interactive ? 'button' : 'div';
  const wrapperProps = interactive
    ? ({ type: 'button', onClick: bounce, 'aria-label': label } as const)
    : {};

  return (
    <div ref={scope}>
      <motion.div
        style={{ originY: 1 }}
        {...(!reduceMotion && { animate: { scale: [1, BREATH_SCALE, 1] } })}
        transition={{ duration: BREATH_DURATION_S, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wrapper
          {...wrapperProps}
          className={`block w-full rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] ${interactive ? 'cursor-pointer' : ''}`}
        >
          <svg
            viewBox="0 -24 240 286"
            aria-hidden="true"
            className="mx-auto h-auto w-full max-w-[320px]"
          >
            <ellipse cx={120} cy={252} rx={62} ry={7} fill="var(--color-pet-ink)" opacity={0.12} />

            <g
              style={{
                color: blendLeafColor(
                  traits.leafColor,
                  presentation.leafColorVar,
                  presentation.plantColorWeight,
                ),
              }}
            >
              <path
                d="M120 148 L120 96"
                stroke="var(--color-pet-stem)"
                strokeWidth={8}
                strokeLinecap="round"
              />
              <g transform="translate(120 100)">
                <Bloom
                  traits={traits}
                  wiltDegrees={angles.droop * 0.15}
                  sway={angles.sway}
                  wilted={mood === 'SAD' || mood === 'SICK'}
                />
                {leafPoses.map((leaf) => (
                  <g
                    key={leaf.key}
                    transform={`rotate(${leaf.baseAngle + angles.droop * leaf.droopRatio + angles.sway * leaf.swayRatio}) scale(${leaf.mirror ? -scale : scale} ${scale})`}
                  >
                    <path
                      d={LEAF_PATHS[traits.leafShape]}
                      fill="currentColor"
                      style={{ transition: 'fill 0.8s ease' }}
                    />
                  </g>
                ))}
              </g>
            </g>

            <path
              d="M62 152 H178 L168 240 Q167 248 158 248 H82 Q73 248 72 240 Z"
              fill={potVars.base}
            />
            <rect x={54} y={140} width={132} height={22} rx={9} fill={potVars.shade} />

            {presentation.showBlush && (
              <g fill="var(--color-pet-blush)" opacity={0.85}>
                <ellipse cx={86} cy={200} rx={8} ry={5} />
                <ellipse cx={154} cy={200} rx={8} ry={5} />
              </g>
            )}

            <Eyes style={eyeStyle} closed={eyesClosed} />
            <path
              d={MOUTH_PATHS[presentation.mouthStyle]}
              stroke="var(--color-pet-ink)"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />

            {presentation.showSweat && (
              <path
                d="M170 168 C165 177 165 182 170 182 C175 182 175 177 170 168 Z"
                fill="var(--color-pet-water)"
              />
            )}

            {presentation.showSparkles && !effect && <SparkleBurst positions={SPARKLE_POSITIONS} />}
            {effect === 'FERTILIZE' && <SparkleBurst positions={SPARKLE_POSITIONS} />}
            {effect === 'WATER' &&
              RAIN_DROPS.map((x, index) => <WaterDrop key={x} x={x} delay={index * 0.15} />)}
            {effect === 'SUN' && <SunGlow />}
            {hearts.map((id) => (
              <FloatingHeart key={id} id={id} onDone={dropHeart} />
            ))}
          </svg>
        </Wrapper>
      </motion.div>
    </div>
  );
}
