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

