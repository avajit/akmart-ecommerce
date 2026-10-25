import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import * as sellerController from "../controllers/seller.controller";

const router = Router();

// ── SellerProfile Creation (Any logged in user can apply to become a seller) ──
router.post("/profile", requireAuth, sellerController.createProfile);

// All subsequent seller management routes: must be logged in + have SELLER or ADMIN role
router.use(requireAuth, requireRole(["SELLER", "ADMIN"]));

// ── SellerProfile Management ──────────────────────────────────
router.get("/profile", sellerController.getProfile);
router.patch("/profile", sellerController.updateProfile);

// ── Seller Products (Own Catalog Items) ────────────────────────
router.get("/products", sellerController.getMyProducts);

// ── SellerListings ─────────────────────────────────────────────
router.post("/listings", sellerController.createListing);
router.get("/listings", sellerController.getListings);
router.patch("/listings/:id", sellerController.updateListing);
router.delete("/listings/:id", sellerController.deleteListing);

// ── SellerOrders ───────────────────────────────────────────────
router.get("/orders", sellerController.getOrders);
router.patch("/orders/:id/status", sellerController.updateOrderStatus);

export default router;
