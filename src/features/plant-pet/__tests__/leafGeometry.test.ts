import { describe, expect, it } from 'vitest';
import { buildLeafPoses, leafScale } from '../leafGeometry';

describe('buildLeafPoses', () => {
  it('draws exactly the number of leaves requested, with a minimum of three', () => {
    expect(buildLeafPoses(5)).toHaveLength(5);
    expect(buildLeafPoses(1)).toHaveLength(3);
  });

  it('fans the leaves out symmetrically around the stem', () => {
    const angles = buildLeafPoses(5).map((leaf) => leaf.baseAngle);

    expect(angles[2]).toBe(0);
    expect(angles[0]).toBe(-angles[4]!);
    expect(angles[1]).toBe(-angles[3]!);
  });

  it('droops the leaves on the left and right in opposite directions', () => {
    const [left, , right] = buildLeafPoses(3);

    expect(Math.sign(left!.droopRatio)).toBe(-1);
    expect(Math.sign(right!.droopRatio)).toBe(1);
  });

  it('spreads wider plants more but never beyond the pot', () => {
    const wide = buildLeafPoses(12);

    expect(Math.max(...wide.map((leaf) => Math.abs(leaf.baseAngle)))).toBeLessThanOrEqual(78);
  });
});

describe('leafScale', () => {
  it('shrinks the leaves as there are more of them, with a floor', () => {
    expect(leafScale(3)).toBe(1);
    expect(leafScale(7)).toBeLessThan(leafScale(5));
    expect(leafScale(30)).toBe(0.7);
  });
});

describe('mirrored leaves', () => {
  it('flips the leaves on the left so asymmetric blades arch outwards', () => {
    const poses = buildLeafPoses(5);

    expect(poses.map((leaf) => leaf.mirror)).toEqual([true, true, false, false, false]);
  });
});
