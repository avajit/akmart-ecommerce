import api from "./client";

// Profile
export const createSellerProfile = (data: any) => api.post("/seller/profile", data).then((res: any) => res.data);
export const getSellerProfile = () => api.get("/seller/profile").then((res: any) => res.data);
export const updateSellerProfile = (data: any) => api.patch("/seller/profile", data).then((res: any) => res.data);

// Products
export const createProduct = (data: any) => api.post("/products", data).then((res: any) => res.data);
export const updateProduct = (id: string, data: any) => api.patch(`/products/${id}`, data).then((res: any) => res.data);
export const submitProduct = (id: string) => api.patch(`/products/${id}/submit`).then((res: any) => res.data);
export const getSellerProducts = () => api.get("/products").then((res: any) => res.data); // Shared endpoint but gets seller view when authenticated

// Listings
export const createListing = (data: any) => api.post("/seller/listings", data).then((res: any) => res.data);
export const getListings = () => api.get("/seller/listings").then((res: any) => res.data);
export const updateListing = (id: string, data: any) => api.patch(`/seller/listings/${id}`, data).then((res: any) => res.data);
export const deleteListing = (id: string) => api.delete(`/seller/listings/${id}`).then((res: any) => res.data);

export const getCategories = () => api.get("/categories/tree").then((res: any) => res.data);
export const getBrands = () => api.get("/categories/brands").then((res: any) => res.data);
