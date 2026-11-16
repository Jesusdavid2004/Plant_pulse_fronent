import { z } from 'zod';

export const LEAF_SHAPES = [
  'ROUND',
  'POINTED',
  'LONG',
  'SPIKY',
  'HEART',
  'GRASS',
  'BROAD',
] as const;
export const LEAF_COLORS = [
  'GREEN',
  'DARK_GREEN',
  'LIGHT_GREEN',
  'BLUE_GREEN',
  'PURPLE',
  'RED',
] as const;
export const BLOOM_SHAPES = ['NONE', 'SPIKE', 'FLOWER'] as const;
export const BLOOM_COLORS = ['PINK', 'RED', 'ORANGE', 'YELLOW', 'PURPLE', 'WHITE', 'BLUE'] as const;
export const HEALTH_STATUSES = ['healthy', 'warning', 'critical'] as const;

export const petTraitsSchema = z.object({
  leafShape: z.enum(LEAF_SHAPES),
  leafCount: z.number().int().min(1).max(12),
  leafColor: z.enum(LEAF_COLORS).default('GREEN'),
  bloomShape: z.enum(BLOOM_SHAPES).default('NONE'),
  bloomColor: z.enum(BLOOM_COLORS).default('PINK'),
});

export const plantSchema = z.object({
  id: z.string(),
  name: z.string(),
  species: z.string().nullable(),
  commonName: z.string().nullable(),
  careCategory: z.string().nullable(),
  petTraits: petTraitsSchema,
  status: z.string(),
  latestHealthScore: z.number().nullable(),
  createdAt: z.string(),
});

export const analysisSchema = z.object({
  id: z.string(),
  plantId: z.string(),
  healthScore: z.number(),
  status: z.enum(HEALTH_STATUSES),
  diagnosis: z.string(),
  carePlan: z.array(z.string()),
  createdAt: z.string(),
});

export const registrationSchema = z.object({
  plant: plantSchema,
  analysis: analysisSchema,
  advice: z.array(z.string()),
  visibleSigns: z.array(z.string()),
});

export const checkupSchema = z.object({
  analysis: analysisSchema,
  advice: z.array(z.string()),
  visibleSigns: z.array(z.string()),
});

export type LeafShape = (typeof LEAF_SHAPES)[number];
export type HealthStatus = (typeof HEALTH_STATUSES)[number];
export type LeafColor = (typeof LEAF_COLORS)[number];
export type BloomColor = (typeof BLOOM_COLORS)[number];
export type BloomShape = (typeof BLOOM_SHAPES)[number];
export type PetTraits = z.infer<typeof petTraitsSchema>;
export type Plant = z.infer<typeof plantSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
export type PlantRegistration = z.infer<typeof registrationSchema>;
export type PlantCheckup = z.infer<typeof checkupSchema>;
