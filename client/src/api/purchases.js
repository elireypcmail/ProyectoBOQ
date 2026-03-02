import { instanceApp } from "./axios";

// -------------------- Vendedores --------------------
export const getAllSuppliers = () => instanceApp.get("/proveedores");
export const getSupplierById = (id) => instanceApp.get(`/proveedores/${id}`);
export const createSupplier = (data) => instanceApp.post("/proveedores", data);
export const updateSupplier = (id, data) => instanceApp.put(`/proveedores/${id}`, data);
export const deleteSupplier = (id) => instanceApp.delete(`/proveedores/${id}`);
export const saveFileSupplier = (id, files, filesJson) => {
  const formData = new FormData()

  // Agregar archivos
  files.forEach((file) => {
    formData.append("files", file)
  })

  // Agregar JSON como string
  formData.append("files_json", JSON.stringify(filesJson))

  return instanceApp.post(`/proveedores/save/file/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

// -------------------- Compras --------------------
export const getAllPurchases = () => instanceApp.get("/compras");
export const getPurchaseById = (id) => instanceApp.get(`/compras/${id}`);
export const createPurchase = (data) => instanceApp.post("/compras", data);
export const updatePurchase = (id, data) => instanceApp.put(`/compras/${id}`, data);
export const deletePurchase = (id) => instanceApp.delete(`/compras/${id}`);
