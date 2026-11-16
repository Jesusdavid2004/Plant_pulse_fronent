import { describe, expect, it } from 'vitest';
import type { GrowthForm, PetTraits } from '../../plants/types';
import { DEFAULT_PET_TRAITS, LEAF_PATHS } from '../leafGeometry';
import { buildPlantLayout, leafScale } from '../plantLayout';

function traits(overrides: Partial<PetTraits>): PetTraits {
  return { ...DEFAULT_PET_TRAITS, leafCount: 5, ...overrides };
}

describe('rosette layout', () => {
  it('draws exactly the number of leaves requested, with a minimum of three', () => {
    expect(buildPlantLayout(traits({ leafCount: 5 })).leaves).toHaveLength(5);
    expect(buildPlantLayout(traits({ leafCount: 1 })).leaves).toHaveLength(3);
  });

  it('fans the leaves out symmetrically around the stem', () => {
    const angles = buildPlantLayout(traits({ leafCount: 5 })).leaves.map((leaf) => leaf.angle);

    expect(angles[2]).toBe(0);
    expect(angles[0]).toBe(-angles[4]!);
    expect(angles[1]).toBe(-angles[3]!);
  });

  it('droops the leaves on the left and right in opposite directions', () => {
    const [left, , right] = buildPlantLayout(traits({ leafCount: 3 })).leaves;

    expect(Math.sign(left!.droopRatio)).toBe(-1);
    expect(Math.sign(right!.droopRatio)).toBe(1);
  });

  it('never spreads the leaves beyond the pot', () => {
    const wide = buildPlantLayout(traits({ leafCount: 12 })).leaves;

    expect(Math.max(...wide.map((leaf) => Math.abs(leaf.angle)))).toBeLessThanOrEqual(78);
  });

  it('flips the leaves on the left so asymmetric blades arch outwards', () => {
    const poses = buildPlantLayout(traits({ leafCount: 5 })).leaves;

    expect(poses.map((leaf) => leaf.mirror)).toEqual([true, true, false, false, false]);
  });

  it('shrinks the leaves as there are more of them, with a floor', () => {
    expect(leafScale(3)).toBe(1);
    expect(leafScale(7)).toBeLessThan(leafScale(5));
    expect(leafScale(30)).toBe(0.7);
  });
});

describe('growth forms', () => {
  it('gives every growth form its own silhouette', () => {
    const forms: GrowthForm[] = [
      'ROSETTE',
      'UPRIGHT',
      'STALKED',
      'BUSHY',
      'PALM',
      'TREE',
      'CACTUS',
      'TRAILING',
    ];

    const signatures = forms.map((growthForm) => {
      const layout = buildPlantLayout(traits({ growthForm }));
      return JSON.stringify([
        layout.leaves.length,
        layout.leaves[0]?.stem,
        layout.leaves[0]?.y,
        layout.leaves[0]?.shape,
        layout.canopy !== null,
        layout.cactus !== null,
        layout.vines.length,
      ]);
    });

    expect(new Set(signatures).size).toBe(forms.length);
  });

  it('draws upright plants as tall blades that start at the pot rim', () => {
    const layout = buildPlantLayout(traits({ growthForm: 'UPRIGHT', leafShape: 'SWORD' }));

    expect(layout.leaves.every((leaf) => leaf.stem === 0)).toBe(true);
    expect(Math.max(...layout.leaves.map((leaf) => Math.abs(leaf.angle)))).toBeLessThan(30);
  });

  it('keeps blades for upright plants even when the leaf shape is round', () => {
    const layout = buildPlantLayout(traits({ growthForm: 'UPRIGHT', leafShape: 'ROUND' }));

    expect(new Set(layout.leaves.map((leaf) => leaf.shape))).toEqual(new Set(['SWORD']));
  });

  it('puts each leaf of a stalked plant on its own stalk', () => {
    const layout = buildPlantLayout(traits({ growthForm: 'STALKED', leafShape: 'BROAD' }));

    expect(layout.leaves.every((leaf) => leaf.stem > 0)).toBe(true);
  });

  it('draws palms with feathery fronds on long canes', () => {
    const layout = buildPlantLayout(
      traits({ growthForm: 'PALM', leafShape: 'ROUND', leafCount: 3 }),
    );

    expect(layout.leaves.length).toBeGreaterThanOrEqual(5);
    expect(new Set(layout.leaves.map((leaf) => leaf.shape))).toEqual(new Set(['FROND']));
    expect(LEAF_PATHS.FROND.length).toBeGreaterThan(200);
  });

  it('makes bushy plants denser than the number of leaves reported', () => {
    const layout = buildPlantLayout(traits({ growthForm: 'BUSHY', leafCount: 5 }));

    expect(layout.leaves.length).toBeGreaterThan(5);
  });

  it('draws a trunk and a crown for trees, growing a wider crown with more leaves', () => {
    const small = buildPlantLayout(traits({ growthForm: 'TREE', leafCount: 3 }));
    const large = buildPlantLayout(traits({ growthForm: 'TREE', leafCount: 10 }));

    expect(small.trunk).not.toBeNull();
    expect(small.leaves).toHaveLength(0);
    expect(large.canopy!.blobs.length).toBeGreaterThan(small.canopy!.blobs.length);
  });

  it('grows arms on cacti with more leaves', () => {
    const arms = (leafCount: number) =>
      buildPlantLayout(traits({ growthForm: 'CACTUS', leafCount })).cactus!.armPaths.length;

    expect([arms(3), arms(5), arms(9)]).toEqual([0, 1, 2]);
  });

  it('hangs vines over the pot for trailing plants, more of them when leafy', () => {
    const sparse = buildPlantLayout(traits({ growthForm: 'TRAILING', leafCount: 3 }));
    const leafy = buildPlantLayout(traits({ growthForm: 'TRAILING', leafCount: 8 }));

    expect(sparse.vines).toHaveLength(2);
    expect(leafy.vines).toHaveLength(4);
    expect(leafy.vines.every((vine) => vine.leaves.length > 0)).toBe(true);
  });
});

describe('blooms', () => {
  it('has no bloom when the plant does not flower', () => {
    expect(buildPlantLayout(traits({ bloomShape: 'NONE' })).bloom).toBeNull();
  });

  it('keeps tall spikes for rosettes and upright plants only', () => {
    const shapeFor = (growthForm: GrowthForm) =>
      buildPlantLayout(traits({ growthForm, bloomShape: 'SPIKE' })).bloom?.shape;

    expect(shapeFor('ROSETTE')).toBe('SPIKE');
    expect(shapeFor('UPRIGHT')).toBe('SPIKE');
    expect(shapeFor('STALKED')).toBe('FLOWER');
    expect(shapeFor('CACTUS')).toBe('FLOWER');
  });

  it('keeps the hooded bract of a peace lily on a stalked plant', () => {
    const bloom = buildPlantLayout(
      traits({ growthForm: 'STALKED', bloomShape: 'SPATHE', bloomColor: 'WHITE' }),
    ).bloom;

    expect(bloom?.shape).toBe('SPATHE');
  });
});
