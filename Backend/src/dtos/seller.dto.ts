import { z } from "zod";

export const createSellerProfileSchema = z.object({
  shopName: z.string().min(2).max(100),
  shopDescription: z.string().max(500).optional(),
  shopLogoUrl: z.string().url().optional(),
  phoneNumber: z.string().min(7).max(20),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(4).max(10),
  country: z.string().length(2).default("NP"),
});

export const updateSellerProfileSchema = z.object({
  shopName: z.string().min(2).max(100).optional(),
  shopDescription: z.string().max(500).optional(),
  shopLogoUrl: z.string().url().optional(),
  phoneNumber: z.string().min(7).max(20).optional(),
  address: z.string().min(5).max(200).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  pincode: z.string().min(4).max(10).optional(),
  country: z.string().length(2).optional(),
  gstNumber: z.string().max(20).optional(),
  panNumber: z.string().max(20).optional(),
  bankAccountNumber: z.string().max(30).optional(),
  bankIfscCode: z.string().max(20).optional(),
  bankAccountName: z.string().max(100).optional(),
});

export type CreateSellerProfileDto = z.infer<typeof createSellerProfileSchema>;
export type UpdateSellerProfileDto = z.infer<typeof updateSellerProfileSchema>;

export const createSellerListingSchema = z.object({
  variantId: z.string().uuid(),
  price: z.number().positive(),
  mrp: z.number().positive(),
  stock: z.number().int().min(0),
}).refine(data => data.price <= data.mrp, { message: "Price cannot exceed MRP", path: ["price"] });

export const updateSellerListingSchema = z.object({
  price: z.number().positive().optional(),
  mrp: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateSellerListingDto = z.infer<typeof createSellerListingSchema>;
export type UpdateSellerListingDto = z.infer<typeof updateSellerListingSchema>;
