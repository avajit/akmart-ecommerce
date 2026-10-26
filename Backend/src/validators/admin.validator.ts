import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    description: z.string().optional(),
    parentId: z.string().uuid('Parent ID must be a valid UUID').optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').optional(),
    description: z.string().optional(),
    parentId: z.string().uuid('Parent ID must be a valid UUID').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Brand name must be at least 2 characters'),
    description: z.string().optional(),
    logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Brand name must be at least 2 characters').optional(),
    description: z.string().optional(),
    logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});
