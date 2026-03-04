// api/products.js
import { instanceApp } from "./axios";

// -------------------- Compras --------------------
export const getAllShopping = () => instanceApp.get("/compras");
export const getShoppingById = (id) => instanceApp.get(`/compras/${id}`);
export const createShopping = (data) => instanceApp.post("/compras", data);
export const updateShopping = (id, data) => instanceApp.put(`/compras/${id}`, data);
export const deleteShopping = (id) => instanceApp.delete(`/compras/${id}`);

// -------------------- Ventas --------------------
export const getAllSales = () => instanceApp.get("/ventas");
export const getSalesById = (id) => instanceApp.get(`/ventas/${id}`);
export const createSales = (data) => instanceApp.post("/ventas", data);
export const updateSales = (id, data) => instanceApp.put(`/ventas/${id}`, data);
export const deleteSales = (id) => instanceApp.delete(`/ventas/${id}`);
