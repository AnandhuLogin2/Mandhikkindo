import { z } from 'zod';

export const createReviewSchema = {
  body: z.object({
    shopId: z.string().min(1, 'shopId is required'),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    text: z.string().min(1, 'Review text is required'),
  }),
};

export const reviewQuerySchema = {
  query: z.object({
    shopId: z.string().min(1, 'shopId parameter is required'),
  }),
};
