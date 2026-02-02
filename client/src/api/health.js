// api/health.js
import { instanceApp } from "./axios";

// -------------------- PACIENTES --------------------
export const getPacientes = () => instanceApp.get("/pacientes");
export const getPacienteById = (id) => instanceApp.get(`/pacientes/${id}`);
// export const createPaciente = (data) =>
//   instanceApp.post("/pacientes", data, {
//     headers: {
//       "Content-Type": "multipart/form-data"
//     }
  // });
export const createPaciente = (data) => instanceApp.post(`/pacientes`, data);
export const editPaciente = (id, data) => instanceApp.put(`/pacientes/${id}`, data);
export const deletePaciente = (id) => instanceApp.delete(`/pacientes/${id}`);
export const savePacienteFiles = (id, files, filesJson) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  formData.append("filesJson", JSON.stringify(filesJson));
  return instanceApp.post(`/pacientes/${id}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

// -------------------- MEDICOS --------------------
export const getMedicos = () => instanceApp.get("/medicos");
export const getMedicoById = (id) => instanceApp.get(`/medicos/${id}`);
export const createMedico = (data) => instanceApp.post("/medicos", data);
export const editMedico = (id, data) => instanceApp.put(`/medicos/${id}`, data);
export const deleteMedico = (id) => instanceApp.delete(`/medicos/${id}`);

// -------------------- TIPO MEDICOS --------------------
export const getTipoMedicos = () => instanceApp.get("/tipos/medicos");
export const getTipoMedicoById = (id) => instanceApp.get(`/tipos/medicos/${id}`);
export const createTipoMedico = (data) => instanceApp.post("/tipos/medicos", data);
export const editTipoMedico = (id, data) => instanceApp.put(`/tipos/medicos/${id}`, data);
export const deleteTipoMedico = (id) => instanceApp.delete(`/tipos/medicos/${id}`);

// -------------------- SEGUROS --------------------
export const getSeguros = () => instanceApp.get("/seguros");
export const getSeguroById = (id) => instanceApp.get(`/seguros/${id}`);
export const createSeguro = (data) => instanceApp.post("/seguros", data);
export const editSeguro = (id, data) => instanceApp.put(`/seguros/${id}`, data);
export const deleteSeguro = (id) => instanceApp.delete(`/seguros/${id}`);

// -------------------- HISTORIAS --------------------
export const getHistorias = () => instanceApp.get("/historias");
export const getHistoriasByPaciente = (id) => instanceApp.get(`/historias/paciente/${id}`);
export const getHistoriaById = (id) => instanceApp.get(`/historias/${id}`);
export const createHistoria = (data) => instanceApp.post("/historias", data);
export const editHistoria = (id, data) => instanceApp.put(`/historias/${id}`, data);
export const deleteHistoria = (id) => instanceApp.delete(`/historias/${id}`);
export const saveHistoriaFiles = (id, files, filesJson) => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  formData.append("filesJson", JSON.stringify(filesJson));
  return instanceApp.post(`/historias/${id}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
