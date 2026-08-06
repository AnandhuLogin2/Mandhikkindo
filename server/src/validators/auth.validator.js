import { z } from 'zod';

export const sessionSchema = {
  body: z.object({
    displayName: z.string().optional(),
    photoURL: z.string().url().optional().or(z.literal('')),
  }).optional(),
};
