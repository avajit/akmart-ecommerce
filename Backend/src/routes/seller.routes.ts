import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import * as sellerController from "../controllers/seller.controller";

const router = Router();

// All seller routes: must be logged in + have SELLER role
router.use(requireAuth, requireRole(["SELLER", "ADMIN"]));

// ── SellerProfile ──────────────────────────────────────────────
router.post("/profile", sellerController.createProfile);
router.get("/profile", sellerController.getProfile);
router.patch("/profile", sellerController.updateProfile);

// ── SellerListing ──────────────────────────────────────────────
router.post("/listings", sellerController.createListing);
router.get("/listings", sellerController.getListings);
router.patch("/listings/:id", sellerController.updateListing);
router.delete("/listings/:id", sellerController.deleteListing);

export default router;
