import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as wishlistService from "../services/wishlist.service";
import { z } from "zod";

const p = (val: unknown): string => val as string;

export const getWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user!.userId);
    res.json({ success: true, data: wishlist });
  } catch (err) { next(err); }
};

export const addItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { variantId } = z.object({ variantId: z.string().uuid() }).parse(req.body);
    const result = await wishlistService.addToWishlist(req.user!.userId, variantId);
    res.status(201).json({ success: true, message: "Added to wishlist", data: result });
  } catch (err) { next(err); }
};

export const removeItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await wishlistService.removeFromWishlist(req.user!.userId, p(req.params.variantId));
    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) { next(err); }
};
