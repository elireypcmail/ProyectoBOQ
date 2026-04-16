import { instanceApp } from './axios'

// -------------------- Parametros --------------------
export const getAllParameters = () => instanceApp.get("/parametros");
export const getParameterById = (name) => instanceApp.get(`/parametros/${name}`);
export const createParameter = (data) => instanceApp.post("/parametros", data);
export const updateParameter = (id, data) => instanceApp.put(`/parametros/${id}`, data);
export const deleteParameter = (id) => instanceApp.delete(`/parametros/${id}`);

// -------------------- Imágenes --------------------
export const getAllImages = () => instanceApp.get("/parametros/images");
export const getImageById = (id) => instanceApp.get(`/parametros/images/${id}`);
export const registerImage = (formData) => {
  // formData already contains 'files' (array) and 'files_json'
  return instanceApp.post(`/parametros/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const updateImage = (id, data) => {
  // Si la data es FormData, enviamos los headers correspondientes
  if (data instanceof FormData) {
    return instanceApp.put(`/parametros/images/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  // Si es un JSON normal (ej. solo cambiar el nombre)
  return instanceApp.put(`/parametros/images/${id}`, data);
};

export const deleteImage = (id) => instanceApp.delete(`/parametros/images/${id}`);
