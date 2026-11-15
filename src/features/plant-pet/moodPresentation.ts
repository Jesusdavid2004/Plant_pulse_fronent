import type { CareType, Mood, PlantMood } from './types';

export type EyeStyle = 'open' | 'tired' | 'sad' | 'dizzy' | 'squint';
export type MouthStyle = 'smile' | 'flat' | 'frown' | 'wobbly';

export interface MoodPresentation {
  leafDroopDegrees: number;
  swayAmplitudeDegrees: number;
  swaySpeed: number;
  leafColorVar: string;
  eyeStyle: EyeStyle;
  mouthStyle: MouthStyle;
  showBlush: boolean;
  showSparkles: boolean;
  showSweat: boolean;
}

export const MOOD_PRESENTATION: Record<Mood, MoodPresentation> = {
  HAPPY: {
    leafDroopDegrees: 0,
    swayAmplitudeDegrees: 4,
    swaySpeed: 1.6,
    leafColorVar: 'var(--color-pet-leaf)',
    eyeStyle: 'open',
    mouthStyle: 'smile',
    showBlush: true,
    showSparkles: true,
    showSweat: false,
  },
  CONCERNED: {
    leafDroopDegrees: 20,
    swayAmplitudeDegrees: 2.5,
    swaySpeed: 1.2,
    leafColorVar: 'var(--color-pet-leaf-tired)',
    eyeStyle: 'tired',
    mouthStyle: 'flat',
    showBlush: false,
    showSparkles: false,
    showSweat: false,
  },
  SAD: {
    leafDroopDegrees: 56,
    swayAmplitudeDegrees: 1.2,
    swaySpeed: 0.8,
    leafColorVar: 'var(--color-pet-leaf-dry)',
    eyeStyle: 'sad',
    mouthStyle: 'frown',
    showBlush: false,
    showSparkles: false,
    showSweat: false,
  },
  SICK: {
    leafDroopDegrees: 68,
    swayAmplitudeDegrees: 0.8,
    swaySpeed: 0.6,
    leafColorVar: 'var(--color-pet-leaf-sick)',
    eyeStyle: 'dizzy',
    mouthStyle: 'wobbly',
    showBlush: false,
    showSparkles: false,
    showSweat: true,
  },
};

const NEED_KEYS: Record<CareType, string> = {
  WATER: 'water',
  SUN: 'sun',
  FERTILIZE: 'fertilize',
};

export function needKey(type: CareType): string {
  return NEED_KEYS[type];
}

export function resolveMessageKey(snapshot: PlantMood): string {
  if (snapshot.mood === 'SICK') return 'pet.message.sick';
  if (snapshot.mood === 'HAPPY' || snapshot.mostUrgentNeed === null) return 'pet.message.happy';
  const urgent = snapshot.needs.find((need) => need.type === snapshot.mostUrgentNeed);
  const level = urgent?.level === 'CRITICAL' ? 'critical' : 'low';
  return `pet.message.${level}.${needKey(snapshot.mostUrgentNeed)}`;
}
