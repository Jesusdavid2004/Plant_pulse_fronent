import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const DROOP_EASE_PER_SECOND = 3;
const MAX_FRAME_SECONDS = 0.05;
const MILLISECONDS_PER_SECOND = 1000;

export interface PetAngles {
  droop: number;
  sway: number;
}

interface MotionTarget {
  droopDegrees: number;
  swayAmplitudeDegrees: number;
  swaySpeed: number;
}

export function usePetMotion(target: MotionTarget): PetAngles {
  const reduceMotion = useReducedMotion();
  const targetRef = useRef(target);
  const [angles, setAngles] = useState<PetAngles>({ droop: target.droopDegrees, sway: 0 });

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    if (reduceMotion) return;

    let droop = targetRef.current.droopDegrees;
    let previousTime = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const deltaSeconds = Math.min((now - previousTime) / MILLISECONDS_PER_SECOND, MAX_FRAME_SECONDS);
      previousTime = now;
      const current = targetRef.current;
      droop += (current.droopDegrees - droop) * Math.min(1, deltaSeconds * DROOP_EASE_PER_SECOND);
      const sway =
        Math.sin((now / MILLISECONDS_PER_SECOND) * current.swaySpeed) * current.swayAmplitudeDegrees;
      setAngles({ droop, sway });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, target.droopDegrees]);

  return reduceMotion ? { droop: target.droopDegrees, sway: 0 } : angles;
}
