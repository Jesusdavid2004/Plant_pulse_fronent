import { describe, expect, it } from 'vitest';
import { blendLeafColor, bloomColorVar, leafColorVar } from '../traitColors';

describe('trait colors', () => {
  it('maps trait names to design tokens', () => {
    expect(leafColorVar('DARK_GREEN')).toBe('var(--color-plant-leaf-dark-green)');
    expect(bloomColorVar('PINK')).toBe('var(--color-plant-bloom-pink)');
  });

  it('keeps the natural leaf color when the plant is happy', () => {
    expect(blendLeafColor('GREEN', 'var(--mood)', 100)).toBe(leafColorVar('GREEN'));
  });

  it('blends the natural color with the mood color when the plant is struggling', () => {
    expect(blendLeafColor('GREEN', 'var(--mood)', 30)).toBe(
      'color-mix(in srgb, var(--color-plant-leaf-green) 30%, var(--mood))',
    );
  });
});
