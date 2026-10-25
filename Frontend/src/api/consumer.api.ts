import api from "./client";

// Browse Products
export const browseProducts = (params?: any) => api.get("/products", { params }).then((res: any) => res.data);
export const getProductBySlug = (slug: string) => api.get(`/products/slug/${slug}`).then((res: any) => res.data);

// Cart
export const getCart = () => api.get("/cart").then((res: any) => res.data);
export const addToCart = (data: { sellerListingId: string, variantId: string, quantity: number }) => api.post("/cart/items", data).then((res: any) => res.data);
export const updateCartItem = (id: string, quantity: number) => api.patch(`/cart/items/${id}`, { quantity }).then((res: any) => res.data);
export const removeCartItem = (id: string) => api.delete(`/cart/items/${id}`).then((res: any) => res.data);
export const clearCart = () => api.delete("/cart").then((res: any) => res.data);

// Wishlist
export const getWishlist = () => api.get("/wishlist").then((res: any) => res.data);
export const addToWishlist = (variantId: string) => api.post("/wishlist/items", { variantId }).then((res: any) => res.data);
export const removeFromWishlist = (variantId: string) => api.delete(`/wishlist/items/${variantId}`).then((res: any) => res.data);

// Reviews
export const getProductReviews = (productId: string, params?: any) => api.get(`/products/${productId}/reviews`, { params }).then((res: any) => res.data);
export const submitReview = (productId: string, data: any) => api.post(`/products/${productId}/reviews`, data).then((res: any) => res.data);

// Categories (Public)
export const getCategoryTree = () => api.get("/categories/tree").then((res: any) => res.data);
export const getCategoryFilters = (slug: string) => api.get(`/categories/${slug}/filters`).then((res: any) => res.data);
export const getBrands = () => api.get("/categories/brands").then((res: any) => res.data);

