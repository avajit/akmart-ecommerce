import { AppError } from "../utils/AppError";
import { prisma } from "../app";

const getOrCreateWishlist = async (userId: string) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { name: true, slug: true } },
              images: { where: { isPrimary: true }, take: 1 },
              listings: { where: { isActive: true, deletedAt: null }, orderBy: { price: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, slug: true } },
                images: { where: { isPrimary: true }, take: 1 },
                listings: { where: { isActive: true, deletedAt: null }, orderBy: { price: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });
  }
  return wishlist;
};

export const getWishlist = async (userId: string) => {
  const wishlist = await getOrCreateWishlist(userId);
  // Add availability info per item
  const items = wishlist.items.map(item => ({
    ...item,
    cheapestPrice: item.variant.listings[0]?.price ?? null,
    isAvailable: item.variant.listings.length > 0,
  }));
  return { ...wishlist, items };
};

export const addToWishlist = async (userId: string, variantId: string) => {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant || variant.deletedAt) throw new AppError("Variant not found", 404, "NOT_FOUND");

  const wishlist = await getOrCreateWishlist(userId);

  // Idempotent — ignore if already in wishlist
  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
  });
  if (existing) return { alreadyExists: true };

  return prisma.wishlistItem.create({
    data: { wishlistId: wishlist.id, variantId },
  });
};

export const removeFromWishlist = async (userId: string, variantId: string) => {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) throw new AppError("Wishlist not found", 404, "NOT_FOUND");

  const item = await prisma.wishlistItem.findUnique({
    where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
  });
  if (!item) throw new AppError("Item not in wishlist", 404, "NOT_FOUND");

  return prisma.wishlistItem.delete({
    where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
  });
};
