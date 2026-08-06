import { z } from 'zod';

export const createShopSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    district: z.string().min(1, 'District is required'),
    location: z.string().min(1, 'Location is required'),
    lat: z.number({ required_error: 'Latitude is required' }),
    lng: z.number({ required_error: 'Longitude is required' }),
    types: z.array(z.string()).min(1, 'At least one type/category is required'),
    rating: z.number().min(0).max(5).default(0),
    reviews: z.number().min(0).default(0),
  }),
};

export const updateShopSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    district: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    types: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
    reviews: z.number().min(0).optional(),
  }),
};

export const shopQuerySchema = {
  query: z.object({
    district: z.string().optional(),
    type: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['rating', 'reviews']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
};
