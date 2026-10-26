import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import * as wishlistController from "../controllers/wishlist.controller";

const router = Router();

router.use(requireAuth, requireRole(["CONSUMER", "SELLER", "ADMIN"]));

router.get("/", wishlistController.getWishlist);
router.delete("/", wishlistController.clearWishlist);
router.post("/items", wishlistController.addItem);
router.delete("/items/:variantId", wishlistController.removeItem);

export default router;
