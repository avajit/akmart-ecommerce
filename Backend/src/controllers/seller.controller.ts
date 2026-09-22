import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import * as sellerService from "../services/seller.service";
import { createSellerProfileSchema, updateSellerProfileSchema, createSellerListingSchema, updateSellerListingSchema } from "../dtos/seller.dto";

// ── SellerProfile controllers ─────────────────────────────────

export const createProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto = createSellerProfileSchema.parse(req.body);
    const profile = await sellerService.createSellerProfile(req.user!.userId, dto);
    res.status(201).json({ success: true, message: "Seller profile created", data: profile });
  } catch (err) { next(err); }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await sellerService.getSellerProfile(req.user!.userId);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto = updateSellerProfileSchema.parse(req.body);
    const profile = await sellerService.updateSellerProfile(req.user!.userId, dto);
    res.json({ success: true, message: "Seller profile updated", data: profile });
  } catch (err) { next(err); }
};

// ── SellerListing controllers ─────────────────────────────────

export const createListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto = createSellerListingSchema.parse(req.body);
    const listing = await sellerService.createSellerListing(req.user!.userId, dto);
    res.status(201).json({ success: true, message: "Listing created", data: listing });
  } catch (err) { next(err); }
};

export const getListings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const listings = await sellerService.getSellerListings(req.user!.userId);
    res.json({ success: true, data: listings });
  } catch (err) { next(err); }
};

export const updateListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto = updateSellerListingSchema.parse(req.body);
    const listingId = req.params.id as string;
    const listing = await sellerService.updateSellerListing(req.user!.userId, listingId, dto);
    res.json({ success: true, message: "Listing updated", data: listing });
  } catch (err) { next(err); }
};

export const deleteListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const listingId = req.params.id as string;
    await sellerService.deleteSellerListing(req.user!.userId, listingId);
    res.json({ success: true, message: "Listing deactivated" });
  } catch (err) { next(err); }
};
