// api/products.js
import { instanceApp } from "./axios";

// -------------------- PRODUCTOS --------------------
export const getAllProducts = () => instanceApp.get("/productos");
export const getProductById = (id) => instanceApp.get(`/productos/${id}`);
export const createProduct = (data) => instanceApp.post("/productos", data);
export const updateProduct = (id, data) => instanceApp.put(`/productos/${id}`, data);
export const deleteProduct = (id) => instanceApp.delete(`/productos/${id}`);

// -------------------- CATEGORIAS --------------------
export const getAllCategories = () => instanceApp.get("/categorias");
export const getCategoryById = (id) => instanceApp.get(`/categorias/${id}`);
export const createCategory = (data) => instanceApp.post("/categorias", data);
export const updateCategory = (id, data) => instanceApp.put(`/categorias/${id}`, data);
export const deleteCategory = (id) => instanceApp.delete(`/categorias/${id}`);

// -------------------- MARCAS --------------------
export const getAllBrands = () => instanceApp.get("/marcas");
export const getBrandById = (id) => instanceApp.get(`/marcas/${id}`);
export const createBrand = (data) => instanceApp.post("/marcas", data);
export const updateBrand = (id, data) => instanceApp.put(`/marcas/${id}`, data);
export const deleteBrand = (id) => instanceApp.delete(`/marcas/${id}`);

// -------------------- LOTES --------------------
export const getAllLotes = () => instanceApp.get("/lotes");
export const getLoteById = (id) => instanceApp.get(`/lotes/${id}`);
export const createLote = (data) => instanceApp.post("/lotes", data);
export const updateLote = (id, data) => instanceApp.put(`/lotes/${id}`, data);
export const deleteLote = (id) => instanceApp.delete(`/lotes/${id}`);

// -------------------- INVENTARIO --------------------
export const getAllInventory = () => instanceApp.get("/inventory");
export const getInventoryById = (id) => instanceApp.get(`/inventory/${id}`);
export const createInventory = (data) => instanceApp.post("/inventory", data);
export const updateInventory = (id, data) => instanceApp.put(`/inventory/${id}`, data);
export const deleteInventory = (id) => instanceApp.delete(`/inventory/${id}`);

// -------------------- DEPOSITOS --------------------
export const getAllDeposits = () => instanceApp.get("/deposits");
export const getDepositById = (id) => instanceApp.get(`/deposits/${id}`);
export const createDeposit = (data) => instanceApp.post("/deposits", data);
export const updateDeposit = (id, data) => instanceApp.put(`/deposits/${id}`, data);
export const deleteDeposit = (id) => instanceApp.delete(`/deposits/${id}`);

// -------------------- KARDEX GENERAL --------------------
export const getAllKardexG = () => instanceApp.get("/kardex/general");
export const getKardexGById = (id) => instanceApp.get(`/kardex/general/${id}`);
export const createKardexG = (data) => instanceApp.post("/kardex/general", data);

// -------------------- KARDEX DEPOSITO --------------------
export const getAllKardexDep = () => instanceApp.get("/kardex/deposit");
export const getKardexDepById = (id) => instanceApp.get(`/kardex/deposit/${id}`);
export const createKardexDep = (data) => instanceApp.post("/kardex/deposit", data);
