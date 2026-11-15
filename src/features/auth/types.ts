import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
});

export const authSessionSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
});

export const MIN_PASSWORD_LENGTH = 8;

export type User = z.infer<typeof userSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
