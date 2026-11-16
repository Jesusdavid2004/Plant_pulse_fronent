import type { BloomColor, LeafColor } from '../plants/types';
import type { PotKey, SceneKey } from './types';

const FULL_WEIGHT_PERCENT = 100;

function toTokenName(value: string): string {
  return value.toLowerCase().replaceAll('_', '-');
}

export function leafColorVar(color: LeafColor): string {
  return `var(--color-plant-leaf-${toTokenName(color)})`;
}

export function bloomColorVar(color: BloomColor): string {
  return `var(--color-plant-bloom-${toTokenName(color)})`;
}

export function blendLeafColor(
  color: LeafColor,
  moodColorVar: string,
  plantColorWeight: number,
): string {
  if (plantColorWeight >= FULL_WEIGHT_PERCENT) return leafColorVar(color);
  return `color-mix(in srgb, ${leafColorVar(color)} ${plantColorWeight}%, ${moodColorVar})`;
}

export function potColorVars(pot: PotKey): { base: string; shade: string } {
  const name = toTokenName(pot);
  return { base: `var(--color-pot-${name})`, shade: `var(--color-pot-${name}-shade)` };
}

export function sceneColorVars(scene: SceneKey): { sky: string; ground: string; accent: string } {
  const name = toTokenName(scene);
  return {
    sky: `var(--color-scene-${name}-sky)`,
    ground: `var(--color-scene-${name}-ground)`,
    accent: `var(--color-scene-${name}-accent)`,
  };
}
