import { instanceApp } from './axios';

/* ================= ENTITIES API ================= */

// Obtener todos los registros de una tabla
export const getEntities = (table) => instanceApp.get(`/auth/${table}`);

// Obtener un registro por ID
export const getEntity = (table, id) => instanceApp.get(`/auth/${table}/${id}`);

// Crear un nuevo registro
export const createEntity = (table, data) => instanceApp.post(`/auth/${table}`, data);

// Editar un registro
export const editEntity = (table, id, data) => instanceApp.put(`/auth/${table}/${id}`, data);

// Eliminar un registro
export const deleteEntity = (table, id) => instanceApp.delete(`/auth/${table}/${id}`);

// Guardar archivos (opcional, si alguna entity maneja archivos)
export const saveFilesEntity = (table, id, files, filesJson) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  formData.append('files_json', JSON.stringify(filesJson));

  return instanceApp.post(`/auth/${table}/save/file/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Colecciones genéricas (si se necesitan)
export const getCollection = (type) => instanceApp.get(`/collection/${type}`);
