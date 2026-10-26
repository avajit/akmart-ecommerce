import { AppError } from "../utils/AppError";
import { prisma } from "../app";

export interface ValidateCouponResult {
  valid: boolean;
  coupon: {
    id: string;
    code: string;
    description: string | null;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    discountAmount: number;
    maxDiscount: number | null;
    minOrderAmount: number | null;
  };
}

/**
 * Validates a promo code against cart subtotal, active status, date range, and usage limits.
 */
export const validateCoupon = async (
  code: string,
  subtotal: number,
  _userId?: string
): Promise<ValidateCouponResult> => {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    throw new AppError("Coupon code is required", 400, "COUPON_REQUIRED");
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: cleanCode },
  });

  if (!coupon || !coupon.isActive) {
    throw new AppError(`Promo code "${cleanCode}" is invalid or no longer active`, 400, "INVALID_COUPON");
  }

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    throw new AppError("This promo code is not active yet", 400, "COUPON_NOT_STARTED");
  }

  if (coupon.endDate && now > coupon.endDate) {
    throw new AppError("This promo code has expired", 400, "COUPON_EXPIRED");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("This promo code has reached its maximum redemption limit", 400, "COUPON_LIMIT_REACHED");
  }

  const minOrder = Number(coupon.minOrderAmount || 0);
  if (minOrder > 0 && subtotal < minOrder) {
    throw new AppError(
      `Minimum order of NPR ${minOrder.toLocaleString()} required for promo code "${coupon.code}"`,
      400,
      "MIN_ORDER_NOT_MET"
    );
  }

  // Calculate discount amount
  const discountVal = Number(coupon.discountValue);
  const maxDisc = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;
  let discountAmount: number;

  if (coupon.discountType === "PERCENTAGE") {
    const calculated = Math.round((subtotal * discountVal) / 100);
    discountAmount = maxDisc && calculated > maxDisc ? maxDisc : calculated;
  } else {
    // FIXED
    discountAmount = Math.min(discountVal, subtotal);
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType as "PERCENTAGE" | "FIXED",
      discountValue: discountVal,
      discountAmount,
      maxDiscount: maxDisc,
      minOrderAmount: minOrder || null,
    },
  };
};

/**
 * Returns active public coupons for display chips on Cart and Checkout pages.
 */
export const getPublicCoupons = async () => {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ],
    },
    select: {
      id: true,
      code: true,
      description: true,
      discountType: true,
      discountValue: true,
      maxDiscount: true,
      minOrderAmount: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return coupons.map((c) => ({
    ...c,
    discountValue: Number(c.discountValue),
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
  }));
};
