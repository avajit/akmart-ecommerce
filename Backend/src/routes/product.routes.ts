import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import * as productController from "../controllers/product.controller";

const router = Router();

// Public / browse routes (auth optional for role-based filtering)
import { NextFunction, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../app";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { role: true } });
      if (user && user.isActive) {
        req.user = { ...decoded, roleName: user.role.name };
      }
    } catch {
      // ignore invalid tokens for optional auth
    }
  }
  next();
};

router.get("/", optionalAuth, productController.browseProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id/reviews", productController.getProductReviews);

import { validateRequest } from "../middlewares/validateRequest";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";

// Protected routes (Admin / Seller)
router.post("/", requireAuth, requireRole(["ADMIN", "SELLER"]), validateRequest(createProductSchema), productController.createProduct);
router.patch("/:id/submit", requireAuth, requireRole(["ADMIN", "SELLER"]), productController.submitProduct);
router.patch("/:id", requireAuth, requireRole(["ADMIN", "SELLER"]), validateRequest(updateProductSchema), productController.updateProduct);
router.delete("/:id", requireAuth, requireRole(["ADMIN", "SELLER"]), productController.deleteProduct);

// Protected route (Consumer only - verified buyer reviews)
router.post("/:id/reviews", requireAuth, requireRole(["CONSUMER"]), productController.submitReview);

export default router;
