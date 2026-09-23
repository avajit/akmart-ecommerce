import { AppError } from "../utils/AppError";
import { CreateSellerProfileDto, UpdateSellerProfileDto, CreateSellerListingDto, UpdateSellerListingDto } from "../dtos/seller.dto";
import { prisma } from "../app";

// ── SellerProfile ─────────────────────────────────────────────

export const createSellerProfile = async (userId: string, dto: CreateSellerProfileDto) => {
  const existing = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (existing) throw new AppError("Seller profile already exists", 409, "PROFILE_EXISTS");

  return prisma.sellerProfile.create({ data: { userId, ...dto } });
};

export const getSellerProfile = async (userId: string) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");
  return profile;
};

export const updateSellerProfile = async (userId: string, dto: UpdateSellerProfileDto) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  // Auto-enable payout if all payout fields are filled
  const merged = { ...profile, ...dto };
  const isPayoutEnabled =
    !!merged.gstNumber &&
    !!merged.panNumber &&
    !!merged.bankAccountNumber &&
    !!merged.bankIfscCode &&
    !!merged.bankAccountName;

  return prisma.sellerProfile.update({
    where: { userId },
    data: { ...dto, isPayoutEnabled },
  });
};

// ── SellerListing ─────────────────────────────────────────────

export const createSellerListing = async (userId: string, dto: CreateSellerListingDto) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Seller profile required before creating a listing", 403, "PROFILE_REQUIRED");

  // Validate variant exists and its product is APPROVED
  const variant = await prisma.productVariant.findUnique({
    where: { id: dto.variantId },
    include: { product: { select: { status: true } } },
  });
  if (!variant) throw new AppError("Variant not found", 404, "VARIANT_NOT_FOUND");
  if (variant.deletedAt) throw new AppError("Variant has been deleted", 410, "VARIANT_DELETED");
  if (variant.product.status !== "APPROVED") {
    throw new AppError("Product must be APPROVED before creating a listing", 403, "PRODUCT_NOT_APPROVED");
  }

  // Check for existing active listing
  const existingListing = await prisma.sellerListing.findFirst({
    where: { sellerProfileId: profile.id, variantId: dto.variantId, deletedAt: null },
  });
  if (existingListing) throw new AppError("You already have an active listing for this variant", 409, "LISTING_EXISTS");

  return prisma.sellerListing.create({
    data: {
      sellerProfileId: profile.id,
      variantId: dto.variantId,
      price: dto.price,
      mrp: dto.mrp,
      stock: dto.stock,
    },
    include: {
      variant: { include: { product: { select: { name: true, slug: true } } } },
    },
  });
};

export const getSellerListings = async (userId: string) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  const listings = await prisma.sellerListing.findMany({
    where: { sellerProfileId: profile.id, deletedAt: null },
    include: {
      variant: {
        include: {
          product: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return listings.map(l => ({
    ...l,
    availableStock: l.stock - l.reservedStock,
  }));
};

export const updateSellerListing = async (userId: string, listingId: string, dto: UpdateSellerListingDto) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  const listing = await prisma.sellerListing.findFirst({
    where: { id: listingId, sellerProfileId: profile.id, deletedAt: null },
  });
  if (!listing) throw new AppError("Listing not found", 404, "LISTING_NOT_FOUND");

  // Stock safety: cannot reduce stock below reservedStock
  if (dto.stock !== undefined && dto.stock < listing.reservedStock) {
    throw new AppError(
      `Cannot reduce stock below reserved quantity (${listing.reservedStock} units reserved in active checkouts)`,
      400,
      "STOCK_BELOW_RESERVED"
    );
  }

  return prisma.sellerListing.update({
    where: { id: listingId },
    data: dto,
    include: {
      variant: { include: { product: { select: { name: true, slug: true } } } },
    },
  });
};

export const deleteSellerListing = async (userId: string, listingId: string) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  const listing = await prisma.sellerListing.findFirst({
    where: { id: listingId, sellerProfileId: profile.id, deletedAt: null },
  });
  if (!listing) throw new AppError("Listing not found", 404, "LISTING_NOT_FOUND");

  // Soft delete — do NOT release reservedStock (Module 3 handles that)
  return prisma.sellerListing.update({
    where: { id: listingId },
    data: { deletedAt: new Date(), isActive: false },
  });
};

// ── SellerOrders ──────────────────────────────────────────────

export const getSellerOrders = async (userId: string) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  return prisma.orderItem.findMany({
    where: { sellerId: profile.id },
    include: {
      order: {
        include: {
          user: { select: { fullName: true, email: true, phoneNumber: true } },
          shippingAddress: true
        }
      },
      sellerListing: {
        include: {
          variant: { include: { product: { select: { name: true, slug: true } } } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateSellerOrderStatus = async (userId: string, orderItemId: string, status: any) => {
  const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Seller profile not found", 404, "PROFILE_NOT_FOUND");

  const orderItem = await prisma.orderItem.findFirst({
    where: { id: orderItemId, sellerId: profile.id },
  });
  if (!orderItem) throw new AppError("Order item not found", 404, "NOT_FOUND");

  return prisma.orderItem.update({
    where: { id: orderItemId },
    data: { status },
  });
};
