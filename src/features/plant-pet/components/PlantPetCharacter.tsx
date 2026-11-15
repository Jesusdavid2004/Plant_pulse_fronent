import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { useBlink } from '../hooks/useBlink';
import { usePetMotion } from '../hooks/usePetMotion';
import { MOOD_PRESENTATION, type EyeStyle, type MouthStyle } from '../moodPresentation';
import type { CareType, Mood } from '../types';
import type { PetTraits } from '../../plants/types';
import { buildLeafPoses, DEFAULT_PET_TRAITS, LEAF_PATHS, leafScale } from '../leafGeometry';

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

export interface PlantPetCharacterProps {
  mood: Mood;
  effect: CareType | null;
  urgentNeed: CareType | null;
  label: string;
  traits?: PetTraits;
  interactive?: boolean;
}

export function PlantPetCharacter({
  mood,
  effect,
  urgentNeed,
  label,
  traits = DEFAULT_PET_TRAITS,
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

  const bounce = () => {
    if (reduceMotion) return;
    void animate(scope.current, { y: [0, BOUNCE_HEIGHT_PX, 0] }, { duration: BOUNCE_DURATION_S });
  };

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
            viewBox="0 0 240 262"
            aria-hidden="true"
            className="mx-auto h-auto w-full max-w-[320px]"
          >
            <ellipse cx={120} cy={252} rx={62} ry={7} fill="var(--color-pet-ink)" opacity={0.12} />

            <g style={{ color: presentation.leafColorVar }}>
              <path
                d="M120 148 L120 96"
                stroke="var(--color-pet-stem)"
                strokeWidth={8}
                strokeLinecap="round"
              />
              <g transform="translate(120 100)">
                {leafPoses.map((leaf) => (
                  <g
                    key={leaf.key}
                    transform={`rotate(${leaf.baseAngle + angles.droop * leaf.droopRatio + angles.sway * leaf.swayRatio}) scale(${scale})`}
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
              fill="var(--color-pet-pot)"
            />
            <rect x={54} y={140} width={132} height={22} rx={9} fill="var(--color-pet-pot-shade)" />

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
          </svg>
        </Wrapper>
      </motion.div>
    </div>
  );
}
