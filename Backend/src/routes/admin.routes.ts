import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import * as adminController from "../controllers/admin.controller";

const router = Router();

// All admin routes: must be logged in + ADMIN role
router.use(requireAuth, requireRole(["ADMIN"]));

// ── Dashboard ──────────────────────────────────────────────────
router.get("/dashboard", adminController.getDashboard);

// ── Product Review Queue ───────────────────────────────────────
router.get("/products/pending", adminController.getPendingProducts);
router.get("/products", adminController.getAllProducts);
router.patch("/products/:id/approve", adminController.approveProduct);
router.patch("/products/:id/reject", adminController.rejectProduct);

// ── Seller Management ──────────────────────────────────────────
router.get("/sellers", adminController.getAllSellers);
router.patch("/sellers/:id/verify", adminController.verifySeller);
router.patch("/sellers/:id/reject", adminController.rejectSeller);
router.patch("/sellers/:id/suspend", adminController.suspendSeller);

import { validateRequest } from "../middlewares/validateRequest";
import { 
  createCategorySchema, 
  updateCategorySchema, 
  createBrandSchema, 
  updateBrandSchema 
} from "../validators/admin.validator";

// ── Category Management ────────────────────────────────────────
router.post("/categories", validateRequest(createCategorySchema), adminController.createCategory);
router.patch("/categories/:id", validateRequest(updateCategorySchema), adminController.updateCategory);
router.delete("/categories/:id", adminController.deactivateCategory);
router.get("/categories/:id/attributes", adminController.getCategoryAttributes);
router.post("/categories/:id/attributes", adminController.addCategoryAttribute);
router.delete("/categories/:id/attributes/:attrId", adminController.deleteCategoryAttribute);

// ── Brand Management ───────────────────────────────────────────
router.post("/brands", validateRequest(createBrandSchema), adminController.createBrand);
router.patch("/brands/:id", validateRequest(updateBrandSchema), adminController.updateBrand);
router.delete("/brands/:id", adminController.deactivateBrand);

// ── Order Management ───────────────────────────────────────────
router.get("/orders", adminController.getAllOrders);
router.get("/orders/:id", adminController.getAdminOrderById);
router.patch("/orders/:id/status", adminController.updateOrderStatus);

export default router;
