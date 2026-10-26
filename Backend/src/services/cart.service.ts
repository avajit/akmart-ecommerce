import { AppError } from "../utils/AppError";
import { prisma } from "../app";

// Auto-creates cart if user has none, returns it
const getOrCreateCart = async (userId: string) => {
  const itemInclude = {
    variant: { include: { product: { select: { name: true, slug: true } }, images: { where: { isPrimary: true }, take: 1 } } },
    sellerListing: {
      include: {
        sellerProfile: { select: { shopName: true } },
        variant: { include: { product: { select: { name: true, slug: true } }, images: { where: { isPrimary: true }, take: 1 } } }
      }
    },
  };

  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: itemInclude } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: itemInclude } },
    });
  }
  return cart;
};

export const getCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);

  // Annotate each item with live stock availability
  const items = cart.items.map(item => {
    const available = item.sellerListing.stock - item.sellerListing.reservedStock;
    const priceChanged = Number(item.priceAtAddTime) !== Number(item.sellerListing.price);
    return {
      ...item,
      availableStock: available,
      isAvailable: item.sellerListing.isActive && !item.sellerListing.deletedAt && available >= item.quantity,
      priceChanged,
      currentPrice: item.sellerListing.price,
    };
  });

  return { ...cart, items };
};

export const addToCart = async (userId: string, body: { sellerListingId: string; variantId: string; quantity: number }) => {
  const { sellerListingId, variantId, quantity } = body;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new AppError("Quantity must be a positive integer between 1 and 100", 400, "INVALID_QTY");
  }

  const listing = await prisma.sellerListing.findUnique({
    where: { id: sellerListingId },
    include: { sellerProfile: true },
  });
  if (!listing || listing.deletedAt || !listing.isActive) {
    throw new AppError("This listing is no longer available", 410, "LISTING_UNAVAILABLE");
  }

  // Anti-Self-Purchase Gatekeeper: Block seller from purchasing own listing
  if (listing.sellerProfile?.userId === userId) {
    throw new AppError("You cannot purchase products from your own store", 400, "CANNOT_PURCHASE_OWN_PRODUCT");
  }

  // CRITICAL: Live stock check — NO reservedStock change
  const available = listing.stock - listing.reservedStock;
  if (available < quantity) {
    throw new AppError(`Only ${available} units available`, 400, "OUT_OF_STOCK");
  }

  const cart = await getOrCreateCart(userId);

  // Upsert: if item exists → increment quantity, else create
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_sellerListingId: { cartId: cart.id, sellerListingId } },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > available) throw new AppError(`Only ${available} units available`, 400, "OUT_OF_STOCK");
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId,
      sellerListingId,
      quantity,
      priceAtAddTime: listing.price, // snapshot — immune to future price changes
    },
  });
};

export const updateCartItem = async (userId: string, itemId: string, quantity: number) => {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new AppError("Quantity must be a positive integer between 1 and 100", 400, "INVALID_QTY");
  }

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError("Cart not found", 404, "NOT_FOUND");

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { sellerListing: true },
  });
  if (!item) throw new AppError("Cart item not found", 404, "NOT_FOUND");

  // Live check with new quantity
  const available = item.sellerListing.stock - item.sellerListing.reservedStock;
  if (available < quantity) throw new AppError(`Only ${available} units available`, 400, "OUT_OF_STOCK");

  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
};

export const removeCartItem = async (userId: string, itemId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError("Cart not found", 404, "NOT_FOUND");

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw new AppError("Cart item not found", 404, "NOT_FOUND");

  // NO reservedStock change — stock is only reserved at checkout
  return prisma.cartItem.delete({ where: { id: itemId } });
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};
