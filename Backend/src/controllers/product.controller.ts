import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as productService from "../services/product.service";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
});

const qi = (val: unknown, def = 1): number => parseInt(typeof val === "string" ? val : String(def)) || def;
const p = (val: unknown): string => val as string;

// Public: browse products (role-filtered internally)
export const browseProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await productService.browseProducts(
      req.user?.userId,
      req.user?.roleName,
      req.query
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// Public: get product detail by slug
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductBySlug(p(req.params.slug));
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

// Seller/Admin: create product
export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.user!.userId, req.user!.roleName!, req.body);
    res.status(201).json({ success: true, message: "Product created as DRAFT", data: product });
  } catch (err) { next(err); }
};

// Seller/Admin: submit for review
export const submitProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.submitProductForReview(req.user!.userId, req.user!.roleName!, p(req.params.id));
    res.json({ success: true, message: "Product submitted for review", data: product });
  } catch (err) { next(err); }
};

// Seller/Admin: update product
export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.updateProduct(req.user!.userId, req.user!.roleName!, p(req.params.id), req.body);
    res.json({ success: true, message: "Product updated", data: product });
  } catch (err) { next(err); }
};

// Seller/Admin: soft delete
export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await productService.deleteProduct(req.user!.userId, req.user!.roleName!, p(req.params.id));
    res.json({ success: true, message: "Product deleted" });
  } catch (err) { next(err); }
};

// Public: get reviews
export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.getProductReviews(p(req.params.id), qi(req.query.page), qi(req.query.limit, 10));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// Authenticated: submit review
export const submitReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto = reviewSchema.parse(req.body);
    const review = await productService.submitReview(req.user!.userId, p(req.params.id), dto);
    res.status(201).json({ success: true, message: "Review submitted", data: review });
  } catch (err) { next(err); }
};
