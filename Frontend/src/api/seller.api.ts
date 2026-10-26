import api from "./client";

// Profile
export const createSellerProfile = (data: any) => api.post("/seller/profile", data).then((res: any) => res.data);
export const getSellerProfile = () => api.get("/seller/profile").then((res: any) => res.data);
export const updateSellerProfile = (data: any) => api.patch("/seller/profile", data).then((res: any) => res.data);

// Products
export const createProduct = (data: any) => api.post("/products", data).then((res: any) => res.data);
export const updateProduct = (id: string, data: any) => api.patch(`/products/${id}`, data).then((res: any) => res.data);
export const submitProduct = (id: string) => api.patch(`/products/${id}/submit`).then((res: any) => res.data);
export const getSellerProducts = () => api.get("/seller/products").then((res: any) => res.data);

// Listings
export const createListing = (data: any) => api.post("/seller/listings", data).then((res: any) => res.data);
export const getListings = () => api.get("/seller/listings").then((res: any) => res.data);
export const updateListing = (id: string, data: any) => api.patch(`/seller/listings/${id}`, data).then((res: any) => res.data);
export const deleteListing = (id: string) => api.delete(`/seller/listings/${id}`).then((res: any) => res.data);

// Orders
export const getSellerOrders = () => api.get("/seller/orders").then((res: any) => res.data);
export const updateSellerOrderStatus = (id: string, status: string) => api.patch(`/seller/orders/${id}/status`, { status }).then((res: any) => res.data);

export const getCategories = () => api.get("/categories/tree").then((res: any) => res.data);
export const getBrands = () => api.get("/categories/brands").then((res: any) => res.data);
export const getCategoryFilters = (slugOrId: string) => api.get(`/categories/${slugOrId}/filters`).then((res: any) => res.data);
