import api from "./api";

export const createOrder = (orderData) => api.post("/orders", orderData);

export const myOrders = () => api.get("/orders/mine");

export const getOrder = (id) => api.get(`/orders/${id}`);

export const cancelOrder = (id, reason) => api.put(`/orders/${id}/cancel`, { reason });

export const listAllOrders = () => api.get("/orders/admin/all");

export const updateOrderStatus = (id, status, extraData = {}) => api.put(`/orders/admin/${id}/status`, { status, ...extraData });

export const updateOrderShipping = (id, data) => api.put(`/orders/admin/${id}/shipping`, data);