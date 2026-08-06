import { z } from 'zod';

export const createGroupSchema = {
  body: z.object({
    restaurant: z.string().min(1, 'Restaurant name is required'),
    shopId: z.string().nullable().optional(),
    district: z.string().min(1, 'District is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be formatted HH:mm'),
    max: z.number().int().min(2, 'Maximum group members must be at least 2'),
    message: z.string().default(''),
    category: z.string().min(1, 'Category is required'),
  }),
};

export const groupQuerySchema = {
  query: z.object({
    district: z.string().optional(),
    category: z.string().optional(),
    date: z.string().optional(),
  }),
};
