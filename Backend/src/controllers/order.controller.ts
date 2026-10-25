import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as orderService from "../services/order.service";
import { checkoutSchema, addAddressSchema, toOrderResponseDTO, toAddressResponseDTO } from "../dtos/order.dto";

export const checkout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto = checkoutSchema.parse(req.body);
    const order = await orderService.checkout(req.user!.userId, dto);
    res.status(201).json({ success: true, message: "Order placed successfully", data: toOrderResponseDTO(order) });
  } catch (err) { next(err); }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getMyOrders(req.user!.userId);
    res.json({ success: true, message: "Orders retrieved successfully", data: orders.map(toOrderResponseDTO) });
  } catch (err) { next(err); }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await orderService.getOrderById(req.user!.userId, orderId);
    res.json({ success: true, message: "Order retrieved successfully", data: toOrderResponseDTO(order) });
  } catch (err) { next(err); }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await orderService.cancelOrder(req.user!.userId, orderId);
    res.json({ success: true, message: "Order cancelled successfully and stock restored", data: toOrderResponseDTO(order) });
  } catch (err) { next(err); }
};

export const getAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const addresses = await orderService.getAddresses(req.user!.userId);
    res.json({ success: true, message: "Addresses retrieved successfully", data: addresses.map(toAddressResponseDTO) });
  } catch (err) { next(err); }
};

export const addAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto = addAddressSchema.parse(req.body);
    const address = await orderService.addAddress(req.user!.userId, dto);
    res.status(201).json({ success: true, message: "Address added", data: toAddressResponseDTO(address) });
  } catch (err) { next(err); }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const addressId = req.params.id as string;
    await orderService.deleteAddress(req.user!.userId, addressId);
    res.json({ success: true, message: "Address deleted" });
  } catch (err) { next(err); }
};
