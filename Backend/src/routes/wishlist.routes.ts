import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import * as wishlistController from "../controllers/wishlist.controller";

const router = Router();

router.use(requireAuth);

router.get("/", wishlistController.getWishlist);
router.post("/items", wishlistController.addItem);
router.delete("/items/:variantId", wishlistController.removeItem);

export default router;
