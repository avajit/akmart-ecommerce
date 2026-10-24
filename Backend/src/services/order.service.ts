import { AppError } from "../utils/AppError";
import { prisma } from "../app";

export const checkout = async (userId: string, body: any) => {
  const { shippingAddressId, paymentMethod } = body;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          sellerListing: true
        }
      }
    }
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400, "CART_EMPTY");
  }

  // Calculate total and prepare items
  let totalAmount = 0;
  const orderItems: any[] = [];

  for (const item of cart.items) {
    if (!item.sellerListing.isActive || item.sellerListing.deletedAt) {
      throw new AppError("One or more items in your cart are no longer available", 400, "ITEM_UNAVAILABLE");
    }

    const availableStock = item.sellerListing.stock - item.sellerListing.reservedStock;
    if (availableStock < item.quantity) {
      throw new AppError("Not enough stock for some items in your cart", 400, "INSUFFICIENT_STOCK");
    }

    const lineTotal = Number(item.sellerListing.price) * item.quantity;
    totalAmount += lineTotal;

    orderItems.push({
      sellerListingId: item.sellerListingId,
      sellerId: item.sellerListing.sellerProfileId,
      quantity: item.quantity,
      priceAtPurchase: item.sellerListing.price,
    });
  }

  // Create order transaction
  const order = await prisma.$transaction(async (tx) => {
    // Deduct stock atomically with conditional check (stock >= quantity)
    // Prevents race conditions and overselling during flash-sales
    for (const item of cart.items) {
      const updateResult = await tx.sellerListing.updateMany({
        where: {
          id: item.sellerListingId,
          isActive: true,
          deletedAt: null,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updateResult.count === 0) {
        throw new AppError(
          "One or more items in your cart became unavailable or ran out of stock. Please review your cart.",
          400,
          "INSUFFICIENT_STOCK"
        );
      }
    }

    // Create Order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddressId,
        paymentMethod,
        status: 'CONFIRMED', // Assuming COD directly confirms
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            sellerListing: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: { images: { where: { isPrimary: true }, take: 1 } }
                    },
                    images: { take: 1 }
                  }
                },
                sellerProfile: { select: { shopName: true } }
              }
            }
          }
        },
        shippingAddress: true
      }
    });

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return newOrder;
  });

  return order;
};

export const getMyOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          sellerListing: {
            include: {
              variant: {
                include: { 
                  product: { 
                    include: { images: { where: { isPrimary: true }, take: 1 } }
                  },
                  images: { take: 1 }
                }
              },
              sellerProfile: { select: { shopName: true } }
            }
          }
        }
      },
      shippingAddress: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          sellerListing: {
            include: {
              variant: {
                include: { 
                  product: { 
                    include: { images: { where: { isPrimary: true }, take: 1 } }
                  },
                  images: { take: 1 }
                }
              },
              sellerProfile: { select: { shopName: true } }
            }
          }
        }
      },
      shippingAddress: true
    }
  });

  if (!order || order.userId !== userId) {
    throw new AppError("Order not found", 404, "NOT_FOUND");
  }

  return order;
};

// --- Address Management ---

export const getAddresses = async (userId: string) => {
  return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
};

export const addAddress = async (userId: string, body: any) => {
  // If it's the first address, make it default
  const count = await prisma.address.count({ where: { userId } });
  
  if (body.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.create({
    data: {
      userId,
      fullName: body.fullName,
      phone: body.phone,
      street: body.street,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      isDefault: body.isDefault || count === 0
    }
  });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    throw new AppError("Address not found", 404, "NOT_FOUND");
  }

  await prisma.address.delete({ where: { id: addressId } });
};
