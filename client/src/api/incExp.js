// api/products.js
import { instanceApp } from "./axios";

// -------------------- PRODUCTOS --------------------
export const getAllShopping = () => instanceApp.get("/compras");
export const getShoppingById = (id) => instanceApp.get(`/compras/${id}`);
export const createShopping = (data) => instanceApp.post("/compras", data);
export const updateShopping = (id, data) => instanceApp.put(`/compras/${id}`, data);
export const deleteShopping = (id) => instanceApp.delete(`/compras/${id}`);
