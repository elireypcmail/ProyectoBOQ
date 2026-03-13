import { instanceApp } from "./axios";

// -------------------- Vendedores --------------------
export const getAllSellers = () => instanceApp.get("/vendedores");
export const getSellerById = (id) => instanceApp.get(`/vendedores/${id}`);
export const createSeller = (data) => instanceApp.post("/vendedores", data);
export const updateSeller = (id, data) => instanceApp.put(`/vendedores/${id}`, data);
export const deleteSeller = (id) => instanceApp.delete(`/vendedores/${id}`);
export const saveFileSeller = (id, files, filesJson) => {
  const formData = new FormData()

  // Agregar archivos
  files.forEach((file) => {
    formData.append("files", file)
  })

  // Agregar JSON como string
  formData.append("files_json", JSON.stringify(filesJson))

  return instanceApp.post(`/vendedores/save/file/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}
// -------------------- Presupuestos --------------------
export const getAllBudgets = () => instanceApp.get("/presupuestos");
export const getBudgetById = (id) => instanceApp.get(`/presupuestos/${id}`);
export const createBudget = (data) => instanceApp.post("/presupuestos", data);
export const updateBudget = (id, data) => instanceApp.put(`/presupuestos/${id}`, data);
export const deleteBudget = (id) => instanceApp.delete(`/presupuestos/${id}`);


