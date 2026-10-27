import api from './client';

// --- Checkout & Orders ---
export const checkout = (data: { shippingAddressId: string; paymentMethod: string; couponCode?: string; selectedItemIds?: string[]; deliveryNotes?: string; idempotencyKey?: string }) => api.post('/orders/checkout', data, {
  headers: data.idempotencyKey ? { 'Idempotency-Key': data.idempotencyKey } : undefined
}).then(res => res.data);
export const getMyOrders = () => api.get('/orders').then(res => res.data);
export const getOrderById = (id: string) => api.get(`/orders/${id}`).then(res => res.data);
export const cancelOrder = (id: string) => api.patch(`/orders/${id}/cancel`).then(res => res.data);

// --- Addresses ---
export const getAddresses = () => api.get('/orders/addresses/me').then(res => res.data);
export const addAddress = (data: any) => api.post('/orders/addresses', data).then(res => res.data);
export const deleteAddress = (id: string) => api.delete(`/orders/addresses/${id}`).then(res => res.data);

// --- Seller Orders ---
export const getSellerOrders = () => api.get('/seller/orders').then(res => res.data);
export const updateSellerOrderStatus = (id: string, status: string) => api.patch(`/seller/orders/${id}/status`, { status }).then(res => res.data);
