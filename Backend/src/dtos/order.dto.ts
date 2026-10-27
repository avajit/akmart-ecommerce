import { z } from "zod";

// --- Request Validators ---

export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid("Invalid address ID"),
  paymentMethod: z.literal("COD", {
    message: "Only Cash on Delivery (COD) is supported during public beta. Digital wallets (eSewa, Khalti) are deferred to post-beta.",
  }).default("COD"),
  couponCode: z.string().max(50).optional(),
  selectedItemIds: z.array(z.string().uuid()).optional(),
  deliveryNotes: z.string().max(500).optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export const addAddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().regex(/^(96|97|98)\d{8}$/, "Enter a valid 10-digit Nepal mobile number starting with 96, 97, or 98"),
  street: z.string().min(3, "Street/Tole address is required"),
  city: z.string().min(2, "City or municipality is required"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "Province is required"),
  zipCode: z.string().min(3, "Postal/Zip code is required"),
  isDefault: z.boolean().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

// --- Types ---
export type CheckoutDto = z.infer<typeof checkoutSchema>;
export type AddAddressDto = z.infer<typeof addAddressSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

// --- Response Mappers ---

export const toAddressResponseDTO = (address: any) => {
  if (!address) return null;
  return {
    id: address.id,
    fullName: address.fullName,
    phone: address.phone,
    street: address.street,
    city: address.city,
    district: address.district || null,
    state: address.state,
    zipCode: address.zipCode,
    isDefault: address.isDefault,
  };
};

export const toOrderItemResponseDTO = (item: any) => {
  if (!item) return null;
  const primaryImage = 
    item.sellerListing?.variant?.images?.[0]?.url || 
    item.sellerListing?.variant?.product?.images?.[0]?.url || 
    null;

  const productName = item.sellerListing?.variant?.product?.name || "Product";
  const productSlug = item.sellerListing?.variant?.product?.slug || "";
  const variantName = item.sellerListing?.variant?.name || "Default Variant";
  const shopName = item.sellerListing?.sellerProfile?.shopName || "AKMart Seller";
  const price = Number(item.priceAtPurchase || item.sellerListing?.price || 0);

  return {
    id: item.id,
    orderId: item.orderId,
    quantity: item.quantity,
    priceAtPurchase: price,
    status: item.status,
    productName,
    productSlug,
    variantName,
    shopName,
    imageUrl: primaryImage,
    createdAt: item.createdAt,
    sellerListing: {
      id: item.sellerListingId,
      price,
      sellerProfile: { shopName },
      variant: {
        name: variantName,
        product: {
          name: productName,
          slug: productSlug,
        },
        images: primaryImage ? [{ url: primaryImage }] : [],
      },
    },
    order: item.order ? {
      id: item.order.id,
      paymentMethod: item.order.paymentMethod || "COD",
      status: item.order.status,
      totalAmount: Number(item.order.totalAmount || 0),
      deliveryNotes: item.order.deliveryNotes || null,
      createdAt: item.order.createdAt,
      shippingAddress: toAddressResponseDTO(item.order.shippingAddress),
      user: item.order.user,
    } : undefined,
    customerInfo: item.order?.shippingAddress ? {
      name: item.order.shippingAddress.fullName,
      phone: item.order.shippingAddress.phone,
      street: item.order.shippingAddress.street,
      city: item.order.shippingAddress.city,
      district: item.order.shippingAddress.district || null,
      state: item.order.shippingAddress.state,
      zipCode: item.order.shippingAddress.zipCode,
    } : undefined,
  };
};

export const toOrderResponseDTO = (order: any) => {
  if (!order) return null;
  return {
    id: order.id,
    subtotal: Number(order.subtotal || order.totalAmount || 0),
    deliveryFee: Number(order.deliveryFee || 0),
    discountAmount: Number(order.discountAmount || 0),
    couponCode: order.couponCode || null,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    paymentMethod: order.paymentMethod,
    deliveryNotes: order.deliveryNotes || null,
    createdAt: order.createdAt,
    user: order.user ? {
      id: order.user.id,
      fullName: order.user.fullName,
      email: order.user.email,
      phoneNumber: order.user.phoneNumber,
    } : undefined,
    shippingAddress: toAddressResponseDTO(order.shippingAddress),
    items: order.items ? order.items.map(toOrderItemResponseDTO) : [],
  };
};
