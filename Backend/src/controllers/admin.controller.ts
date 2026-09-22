import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as adminService from "../services/admin.service";
import { z } from "zod";

// helper to safely read query params
const q = (val: unknown): string | undefined => (typeof val === "string" ? val : undefined);
const qi = (val: unknown, def = 1): number => parseInt(typeof val === "string" ? val : String(def)) || def;
const p = (val: unknown): string => val as string;

// ── Dashboard ─────────────────────────────────────────────────

export const getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

// ── Product Review ────────────────────────────────────────────

export const getPendingProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getPendingProducts(qi(req.query.page), qi(req.query.limit, 20));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getAllProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getAllProducts(
      q(req.query.status),
      q(req.query.category),
      qi(req.query.page),
      qi(req.query.limit, 20)
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const approveProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await adminService.approveProduct(p(req.params.id));
    res.json({ success: true, message: "Product approved", data: product });
  } catch (err) { next(err); }
};

export const rejectProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = z.object({ reason: z.string().min(5) }).parse(req.body);
    const product = await adminService.rejectProduct(p(req.params.id), reason);
    res.json({ success: true, message: "Product rejected", data: product });
  } catch (err) { next(err); }
};

// ── Seller Verification ───────────────────────────────────────

export const getAllSellers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getAllSellers(
      q(req.query.status),
      qi(req.query.page),
      qi(req.query.limit, 20)
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const verifySeller = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await adminService.verifySeller(p(req.params.id));
    res.json({ success: true, message: "Seller verified and payout enabled", data: profile });
  } catch (err) { next(err); }
};

export const suspendSeller = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await adminService.suspendSeller(p(req.params.id));
    res.json({ success: true, message: "Seller suspended and all listings deactivated", data: profile });
  } catch (err) { next(err); }
};

// ── Category Management ───────────────────────────────────────

const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  parentId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
});

const addAttributeSchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  filterType: z.enum(["MULTISELECT", "RANGE", "BOOLEAN"]),
  unit: z.string().max(20).optional(),
  order: z.number().int().min(0).optional(),
});

export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await adminService.createCategory(data);
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (err) { next(err); }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const category = await adminService.updateCategory(p(req.params.id), req.body);
    res.json({ success: true, message: "Category updated", data: category });
  } catch (err) { next(err); }
};

export const deactivateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await adminService.deactivateCategory(p(req.params.id));
    res.json({ success: true, message: "Category deactivated" });
  } catch (err) { next(err); }
};

export const addCategoryAttribute = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = addAttributeSchema.parse(req.body);
    const attr = await adminService.addCategoryAttribute(p(req.params.id), data);
    res.status(201).json({ success: true, message: "Attribute added", data: attr });
  } catch (err) { next(err); }
};

// ── Brand Management ──────────────────────────────────────────

export const createBrand = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = z.object({ name: z.string().min(2).max(100), logoUrl: z.string().url().optional() }).parse(req.body);
    const brand = await adminService.createBrand(data);
    res.status(201).json({ success: true, message: "Brand created", data: brand });
  } catch (err) { next(err); }
};

export const updateBrand = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const brand = await adminService.updateBrand(p(req.params.id), req.body);
    res.json({ success: true, message: "Brand updated", data: brand });
  } catch (err) { next(err); }
};

export const deactivateBrand = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await adminService.deactivateBrand(p(req.params.id));
    res.json({ success: true, message: "Brand deactivated" });
  } catch (err) { next(err); }
};
