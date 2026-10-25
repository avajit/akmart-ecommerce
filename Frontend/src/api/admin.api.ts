import api from "./client";

// Dashboard
export const getAdminDashboard = () => api.get("/admin/dashboard").then((res: any) => res.data);

// Products
export const getPendingProducts = (params?: any) => api.get("/admin/products/pending", { params }).then((res: any) => res.data);
export const getAllProductsAdmin = (params?: any) => api.get("/admin/products", { params }).then((res: any) => res.data);
export const approveProduct = (id: string) => api.patch(`/admin/products/${id}/approve`).then((res: any) => res.data);
export const rejectProduct = (id: string, reason: string) => api.patch(`/admin/products/${id}/reject`, { reason }).then((res: any) => res.data);

// Sellers
export const getAllSellersAdmin = (params?: any) => api.get("/admin/sellers", { params }).then((res: any) => res.data);
export const verifySeller = (id: string) => api.patch(`/admin/sellers/${id}/verify`).then((res: any) => res.data);
export const suspendSeller = (id: string) => api.patch(`/admin/sellers/${id}/suspend`).then((res: any) => res.data);

// Categories
export const createCategory = (data: any) => api.post("/admin/categories", data).then((res: any) => res.data);
export const updateCategory = (id: string, data: any) => api.patch(`/admin/categories/${id}`, data).then((res: any) => res.data);
export const deactivateCategory = (id: string) => api.delete(`/admin/categories/${id}`).then((res: any) => res.data);
export const getCategoryAttributes = (id: string) => api.get(`/admin/categories/${id}/attributes`).then((res: any) => res.data);
export const addCategoryAttribute = (id: string, data: any) => api.post(`/admin/categories/${id}/attributes`, data).then((res: any) => res.data);
export const deleteCategoryAttribute = (id: string, attrId: string) => api.delete(`/admin/categories/${id}/attributes/${attrId}`).then((res: any) => res.data);

// Brands
export const createBrand = (data: any) => api.post("/admin/brands", data).then((res: any) => res.data);
export const updateBrand = (id: string, data: any) => api.patch(`/admin/brands/${id}`, data).then((res: any) => res.data);
export const deactivateBrand = (id: string) => api.delete(`/admin/brands/${id}`).then((res: any) => res.data);
