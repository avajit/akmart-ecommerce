import { AppError } from "../utils/AppError";
import { prisma, redis } from "../app";
import { validateCoupon } from "./coupon.service";

/**
 * Multi-Vendor Status Rollup Engine: Computes the consolidated Order.status
 * based on individual OrderItem fulfillment statuses across multiple merchants.
 */
export const calculateRolledUpOrderStatus = (itemStatuses: string[]): "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" => {
  if (itemStatuses.length === 0) return "PENDING";
  if (itemStatuses.every((s) => s === "CANCELLED")) return "CANCELLED";

  const activeStatuses = itemStatuses.filter((s) => s !== "CANCELLED");
  if (activeStatuses.length === 0) return "CANCELLED";

  if (activeStatuses.every((s) => s === "DELIVERED")) return "DELIVERED";
  if (activeStatuses.some((s) => s === "SHIPPED" || s === "DELIVERED")) return "SHIPPED";
  if (activeStatuses.some((s) => s === "PENDING")) return "PENDING";
  if (activeStatuses.every((s) => s === "PROCESSING" || s === "CONFIRMED")) return "CONFIRMED";
  return "PENDING";
};

export const rollupOrderStatus = async (orderId: string, txClient?: any) => {
  const client = txClient || prisma;
  const items = await client.orderItem.findMany({
    where: { orderId },
    select: { status: true },
  });

  const newStatus = calculateRolledUpOrderStatus(items.map((i: any) => i.status));
  await client.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
  return newStatus;
};

export const checkout = async (userId: string, body: any) => {
  const { shippingAddressId, paymentMethod, couponCode, selectedItemIds, deliveryNotes } = body;

  // 1. Enforce Cash on Delivery only during Public Beta
  if (paymentMethod && paymentMethod !== "COD") {
    throw new AppError(
      "Only Cash on Delivery (COD) is supported during public beta. Digital wallets (eSewa, Khalti) are deferred to post-beta.",
      400,
      "UNSUPPORTED_PAYMENT_METHOD"
    );
  }

  // 2. Idempotency Gatekeeper: Prevent double-click & race-condition order duplicates
  const idempotencyKey = body.idempotencyKey || (body as any).idempotency_key;
  const redisKey = idempotencyKey ? `idempotency:order:${userId}:${idempotencyKey}` : null;

  if (redisKey) {
    const existingOrderId = await redis.get(redisKey);
    if (existingOrderId && existingOrderId !== "IN_PROGRESS") {
      // Idempotently return the previously created order
      return getOrderById(userId, existingOrderId, "CONSUMER");
    }

    const acquired = await redis.set(redisKey, "IN_PROGRESS", "EX", 60, "NX");
    if (!acquired) {
      throw new AppError(
        "Order submission is already processing. Please wait a moment.",
        409,
        "DUPLICATE_ORDER_SUBMISSION"
      );
    }
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          sellerListing: {
            include: {
              sellerProfile: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400, "CART_EMPTY");
  }

  // Industry Standard: Support selective checkout (buy 1 or selected items while keeping remainder in cart)
  const itemsToCheckout = selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0
    ? cart.items.filter((item: any) => selectedItemIds.includes(item.id))
    : cart.items;

  if (itemsToCheckout.length === 0) {
    throw new AppError("No items selected for checkout", 400, "NO_ITEMS_SELECTED");
  }

  // Calculate subtotal and prepare items
  let subtotal = 0;
  const orderItems: any[] = [];

  for (const item of itemsToCheckout) {
    if (!item.sellerListing.isActive || item.sellerListing.deletedAt) {
      throw new AppError("One or more items in your cart are no longer available", 400, "ITEM_UNAVAILABLE");
    }

    // Anti-Self-Purchase Gatekeeper: Prevent seller checking out their own products
    if (item.sellerListing.sellerProfile?.userId === userId) {
      throw new AppError("You cannot purchase products from your own store", 400, "CANNOT_PURCHASE_OWN_PRODUCT");
    }

    const availableStock = item.sellerListing.stock - item.sellerListing.reservedStock;
    if (availableStock < item.quantity) {
      throw new AppError("Not enough stock for some items in your cart", 400, "INSUFFICIENT_STOCK");
    }

    const lineTotal = Number(item.sellerListing.price) * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      sellerListingId: item.sellerListingId,
      sellerId: item.sellerListing.sellerProfileId,
      quantity: item.quantity,
      priceAtPurchase: item.sellerListing.price,
    });
  }

  // Enterprise Shipping Rule: Free delivery above NPR 2,500; otherwise NPR 100
  const FREE_SHIPPING_THRESHOLD = 2500;
  const STANDARD_DELIVERY_FEE = 100;
  const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_DELIVERY_FEE;

  // Server-side Coupon Validation
  let discountAmount = 0;
  let couponId: string | null = null;
  let appliedCouponCode: string | null = null;

  if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
    const couponRes = await validateCoupon(couponCode, subtotal, userId);
    discountAmount = couponRes.coupon.discountAmount;
    couponId = couponRes.coupon.id;
    appliedCouponCode = couponRes.coupon.code;
  }

  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Create order transaction
  const order = await prisma.$transaction(async (tx) => {
    // Deduct stock atomically with conditional check (stock >= quantity)
    // Prevents race conditions and overselling during flash-sales
    for (const item of itemsToCheckout) {
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

    // Atomically increment coupon usage count with race-condition gatekeeper
    if (couponId) {
      const couponRecord = await tx.coupon.findUnique({ where: { id: couponId } });
      if (couponRecord?.usageLimit && couponRecord.usedCount >= couponRecord.usageLimit) {
        throw new AppError("This promo code has reached its maximum redemption limit", 400, "COUPON_LIMIT_REACHED");
      }

      const updateCouponRes = await tx.coupon.updateMany({
        where: {
          id: couponId,
          isActive: true,
          OR: [
            { usageLimit: null },
            { usedCount: { lt: couponRecord?.usageLimit ?? 999999 } },
          ],
        },
        data: { usedCount: { increment: 1 } },
      });

      if (updateCouponRes.count === 0) {
        throw new AppError("This promo code has reached its maximum redemption limit", 400, "COUPON_LIMIT_REACHED");
      }
    }

    // Create Order with full financial snapshot
    const newOrder = await tx.order.create({
      data: {
        userId,
        subtotal,
        deliveryFee,
        discountAmount,
        couponId,
        couponCode: appliedCouponCode,
        totalAmount,
        shippingAddressId,
        paymentMethod: paymentMethod || 'COD',
        status: 'PENDING',
        deliveryNotes: deliveryNotes || null,
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
        shippingAddress: true,
        coupon: true,
      }
    });

    // Clear only checked-out items from cart (leaving unselected items safely in cart)
    const checkedOutItemIds = itemsToCheckout.map((i: any) => i.id);
    await tx.cartItem.deleteMany({
      where: { id: { in: checkedOutItemIds } }
    });

    return newOrder;
  });

  // Store completed order ID under idempotency key for 24 hours
  if (redisKey) {
    await redis.set(redisKey, order.id, "EX", 86400);
  }

  // Dispatch order confirmation email asynchronously
  prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    .then(user => {
      if (user?.email) {
        import('./email.service')
          .then(({ EmailService }) => EmailService.sendOrderConfirmationEmail(user.email!, order))
          .catch(() => { });
      }
    })
    .catch(() => { });

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

export const getOrderById = async (userId: string, orderId: string, roleName?: string) => {
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
      shippingAddress: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        }
      }
    }
  });

  if (!order || (roleName !== "ADMIN" && order.userId !== userId)) {
    throw new AppError("Order not found", 404, "NOT_FOUND");
  }

  return order;
};

export const cancelOrder = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== userId) {
    throw new AppError("Order not found", 404, "NOT_FOUND");
  }

  if (order.status === "CANCELLED") {
    throw new AppError("This order has already been cancelled", 400, "ALREADY_CANCELLED");
  }

  // Prevent cancellation if items are already shipped or delivered
  const hasShipped = order.items.some(
    (item: any) => item.status === "SHIPPED" || item.status === "DELIVERED"
  );
  if (hasShipped) {
    throw new AppError("Cannot cancel order because one or more items are already shipped or delivered", 400, "ALREADY_SHIPPED");
  }

  return prisma.$transaction(async (tx) => {
    // 1. Restore stock to seller listings
    for (const item of order.items) {
      if (item.status !== "CANCELLED") {
        await tx.sellerListing.update({
          where: { id: item.sellerListingId },
          data: { stock: { increment: item.quantity } },
        });

        await tx.orderItem.update({
          where: { id: item.id },
          data: { status: "CANCELLED" },
        });
      }
    }

    // 2. Mark order as CANCELLED
    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: {
        items: {
          include: {
            sellerListing: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
                sellerProfile: { select: { shopName: true } },
              },
            },
          },
        },
        shippingAddress: true,
      },
    });
  });
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
      district: body.district || null,
      state: body.state,
      zipCode: body.zipCode,
      isDefault: body.isDefault || count === 0
    }
  });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
    include: { _count: { select: { orders: true } } },
  });

  if (!address || address.userId !== userId) {
    throw new AppError("Address not found", 404, "NOT_FOUND");
  }

  if (address._count.orders > 0) {
    throw new AppError(
      "Cannot delete this address because it is associated with past orders in your order history.",
      400,
      "ADDRESS_IN_USE"
    );
  }

  await prisma.address.delete({ where: { id: addressId } });
};
