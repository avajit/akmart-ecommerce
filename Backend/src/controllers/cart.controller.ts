import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as cartService from "../services/cart.service";
import { z } from "zod";

const addItemSchema = z.object({
  sellerListingId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const p = (val: unknown): string => val as string;

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    res.json({ success: true, message: "Cart retrieved successfully", data: cart });
  } catch (err) { next(err); }
};

export const addItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto = addItemSchema.parse(req.body);
    const item = await cartService.addToCart(req.user!.userId, dto);
    res.status(201).json({ success: true, message: "Item added to cart", data: item });
  } catch (err) { next(err); }
};

export const updateItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { quantity } = z.object({ quantity: z.number().int().min(1) }).parse(req.body);
    const item = await cartService.updateCartItem(req.user!.userId, p(req.params.id), quantity);
    res.json({ success: true, message: "Cart item updated", data: item });
  } catch (err) { next(err); }
};

export const removeItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await cartService.removeCartItem(req.user!.userId, p(req.params.id));
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) { next(err); }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await cartService.clearCart(req.user!.userId);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) { next(err); }
};
