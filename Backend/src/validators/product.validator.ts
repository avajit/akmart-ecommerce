import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    categoryId: z.string().uuid('Valid category UUID is required'),
    brandId: z.string().uuid('Valid brand UUID is required').optional().nullable(),
    variants: z.array(z.object({
      name: z.string().min(1, 'Variant name is required'),
      sku: z.string().min(1, 'SKU is required'),
      attributes: z.record(z.any()).optional(),
      images: z.array(z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().optional(),
      })).optional(),
    })).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
    description: z.string().min(5, 'Description must be at least 5 characters').optional(),
    categoryId: z.string().uuid('Valid category UUID is required').optional(),
    brandId: z.string().uuid('Valid brand UUID is required').optional().nullable(),
  }),
});
