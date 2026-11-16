import { z } from 'zod';

export const CARE_TYPES = ['WATER', 'SUN', 'FERTILIZE'] as const;
export const MOODS = ['HAPPY', 'CONCERNED', 'SAD', 'SICK'] as const;
export const NEED_LEVELS = ['SATISFIED', 'LOW', 'CRITICAL'] as const;

export const careTypeSchema = z.enum(CARE_TYPES);
export const moodSchema = z.enum(MOODS);
export const needLevelSchema = z.enum(NEED_LEVELS);

export const needStatusSchema = z.object({
  type: careTypeSchema,
  level: needLevelSchema,
  daysSinceLastCare: z.number().int().nonnegative(),
});

export const plantMoodSchema = z.object({
  plantId: z.string(),
  mood: moodSchema,
  needs: z.array(needStatusSchema),
  mostUrgentNeed: careTypeSchema.nullable(),
});

export const SCENE_KEYS = ['LIVING_ROOM', 'GARDEN', 'NIGHT_SKY', 'BEACH', 'GREENHOUSE'] as const;
export const POT_KEYS = ['TERRACOTTA', 'BLUE', 'WHITE', 'PINK', 'GOLD'] as const;
export const GAME_TYPES = ['DROP_CATCH', 'MEMORY_MATCH'] as const;

export const sceneKeySchema = z.enum(SCENE_KEYS);
export const potKeySchema = z.enum(POT_KEYS);
export const gameTypeSchema = z.enum(GAME_TYPES);

export const rewardSchema = z.object({
  xp: z.number().int().nonnegative(),
  coins: z.number().int().nonnegative(),
});

export const loggedCareSchema = z.object({
  plantId: z.string(),
  type: careTypeSchema,
  occurredAt: z.string(),
  reward: rewardSchema,
  leveledUp: z.boolean(),
  level: z.number().int().positive(),
});

export const petProfileSchema = z.object({
  plantId: z.string(),
  level: z.number().int().positive(),
  xp: z.number().int().nonnegative(),
  xpIntoLevel: z.number().int().nonnegative(),
  xpForNextLevel: z.number().int().positive(),
  coins: z.number().int().nonnegative(),
  scene: sceneKeySchema,
  pot: potKeySchema,
  dailyCoinsRemaining: z.number().int().nonnegative(),
  scenes: z.array(
    z.object({
      key: sceneKeySchema,
      unlockLevel: z.number().int().positive(),
      unlocked: z.boolean(),
    }),
  ),
  pots: z.array(
    z.object({ key: potKeySchema, price: z.number().int().nonnegative(), owned: z.boolean() }),
  ),
});

export const gameResultSchema = z.object({
  reward: rewardSchema,
  leveledUp: z.boolean(),
  profile: petProfileSchema,
});

export type SceneKey = z.infer<typeof sceneKeySchema>;
export type PotKey = z.infer<typeof potKeySchema>;
export type GameType = z.infer<typeof gameTypeSchema>;
export type Reward = z.infer<typeof rewardSchema>;
export type PetProfile = z.infer<typeof petProfileSchema>;
export type GameResult = z.infer<typeof gameResultSchema>;
export type CareType = z.infer<typeof careTypeSchema>;
export type Mood = z.infer<typeof moodSchema>;
export type NeedLevel = z.infer<typeof needLevelSchema>;
export type NeedStatus = z.infer<typeof needStatusSchema>;
export type PlantMood = z.infer<typeof plantMoodSchema>;
export type LoggedCare = z.infer<typeof loggedCareSchema>;
