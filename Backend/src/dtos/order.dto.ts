import { z } from "zod";

// --- Request Validators ---

export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid("Invalid address ID"),
  paymentMethod: z.enum(["COD"]),
});

export const addAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(4),
  isDefault: z.boolean().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

// --- Types ---
export type CheckoutDto = z.infer<typeof checkoutSchema>;
export type AddAddressDto = z.infer<typeof addAddressSchema>;

// --- Response Mappers ---

export const toAddressResponseDTO = (address: any) => {
  if (!address) return null;
  return {
    id: address.id,
    fullName: address.fullName,
    phone: address.phone,
    street: address.street,
    city: address.city,
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
  const shopName = item.sellerListing?.sellerProfile?.shopName || "TechMart Seller";
  const price = Number(item.priceAtPurchase || item.sellerListing?.price || 0);

  return {
    id: item.id,
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
      shippingAddress: toAddressResponseDTO(item.order.shippingAddress),
      user: item.order.user,
    } : undefined,
    customerInfo: item.order?.shippingAddress ? {
      name: item.order.shippingAddress.fullName,
      phone: item.order.shippingAddress.phone,
      city: item.order.shippingAddress.city,
      state: item.order.shippingAddress.state,
    } : undefined,
  };
};

export const toOrderResponseDTO = (order: any) => {
  if (!order) return null;
  return {
    id: order.id,
    totalAmount: Number(order.totalAmount),
    status: order.status,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    shippingAddress: toAddressResponseDTO(order.shippingAddress),
    items: order.items ? order.items.map(toOrderItemResponseDTO) : [],
  };
};
