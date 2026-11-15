import { describe, expect, it } from 'vitest';
import { resolveMessageKey } from '../moodPresentation';
import type { PlantMood } from '../types';

const NEEDS: PlantMood['needs'] = [
  { type: 'WATER', level: 'LOW', daysSinceLastCare: 8 },
  { type: 'SUN', level: 'SATISFIED', daysSinceLastCare: 0 },
  { type: 'FERTILIZE', level: 'SATISFIED', daysSinceLastCare: 2 },
];

describe('resolveMessageKey', () => {
  it('uses the sick message regardless of pending needs', () => {
    const snapshot: PlantMood = {
      plantId: 'p',
      mood: 'SICK',
      needs: NEEDS,
      mostUrgentNeed: 'WATER',
    };

    expect(resolveMessageKey(snapshot)).toBe('pet.message.sick');
  });

  it('uses a mild message for a need that just ran low', () => {
    const snapshot: PlantMood = {
      plantId: 'p',
      mood: 'CONCERNED',
      needs: NEEDS,
      mostUrgentNeed: 'WATER',
    };

    expect(resolveMessageKey(snapshot)).toBe('pet.message.low.water');
  });

  it('uses an urgent message for a critical need', () => {
    const needs = NEEDS.map((need) =>
      need.type === 'WATER' ? { ...need, level: 'CRITICAL' as const } : need,
    );
    const snapshot: PlantMood = { plantId: 'p', mood: 'SAD', needs, mostUrgentNeed: 'WATER' };

    expect(resolveMessageKey(snapshot)).toBe('pet.message.critical.water');
  });

  it('uses the happy message when nothing is pending', () => {
    const snapshot: PlantMood = {
      plantId: 'p',
      mood: 'HAPPY',
      needs: NEEDS,
      mostUrgentNeed: null,
    };

    expect(resolveMessageKey(snapshot)).toBe('pet.message.happy');
  });
});
