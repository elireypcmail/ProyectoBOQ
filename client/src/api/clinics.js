import { instanceApp } from "./axios";

// -------------------- CLINICS --------------------

export const getClinics = () => 
  instanceApp.get("/clinicas");

export const getClinicById = (id) => 
  instanceApp.get(`/clinicas/${id}`);

export const createClinic = (data) => 
  instanceApp.post("/clinicas", data);

export const editClinic = (id, data) => 
  instanceApp.put(`/clinicas/${id}`, data);

export const deleteClinic = (id) => 
  instanceApp.delete(`/clinicas/${id}`);