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

export const loggedCareSchema = z.object({
  plantId: z.string(),
  type: careTypeSchema,
  occurredAt: z.string(),
});

export type CareType = z.infer<typeof careTypeSchema>;
export type Mood = z.infer<typeof moodSchema>;
export type NeedLevel = z.infer<typeof needLevelSchema>;
export type NeedStatus = z.infer<typeof needStatusSchema>;
export type PlantMood = z.infer<typeof plantMoodSchema>;
export type LoggedCare = z.infer<typeof loggedCareSchema>;
