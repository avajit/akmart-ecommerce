import { Request, Response, NextFunction } from "express";
import * as couponService from "../services/coupon.service";
import { AppError } from "../utils/AppError";

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      throw new AppError("Coupon code is required", 400, "COUPON_REQUIRED");
    }
    const numericSubtotal = Number(subtotal || 0);

    const result = await couponService.validateCoupon(code, numericSubtotal, (req as any).user?.id);

    res.status(200).json({
      success: true,
      data: result,
      message: `Coupon "${result.coupon.code}" applied successfully!`,
    });
  } catch (err) {
    next(err);
  }
};

export const getActiveCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await couponService.getPublicCoupons();
    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (err) {
    next(err);
  }
};
