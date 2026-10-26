import { Router } from "express";
import * as couponController from "../controllers/coupon.controller";

const router = Router();

// Publicly list active promotional coupons (for discovery chips on cart/checkout)
router.get("/", couponController.getActiveCoupons);

// Validate promo code against current cart subtotal
router.post("/validate", couponController.validateCoupon);

export default router;
