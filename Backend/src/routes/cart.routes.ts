import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import * as cartController from "../controllers/cart.controller";

const router = Router();

router.use(requireAuth, requireRole(["CONSUMER", "SELLER"]));

router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.patch("/items/:id", cartController.updateItem);
router.delete("/items/:id", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;
