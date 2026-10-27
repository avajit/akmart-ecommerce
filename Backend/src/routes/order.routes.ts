import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import * as orderController from "../controllers/order.controller";
import { checkoutLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.use(requireAuth, requireRole(["CONSUMER", "SELLER", "ADMIN"]));

router.post("/checkout", checkoutLimiter, orderController.checkout);
router.get("/", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/cancel", orderController.cancelOrder);

router.get("/addresses/me", orderController.getAddresses);
router.post("/addresses", orderController.addAddress);
router.delete("/addresses/:id", orderController.deleteAddress);

export default router;
