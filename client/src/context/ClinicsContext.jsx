import React, { createContext, useState, useContext } from "react";
import {
  getClinics,
  getClinicById as apiGetClinicById,
  createClinic,
  editClinic,
  deleteClinic
} from "../api/clinics";

export const ClinicsContext = createContext();

export const useClinics = () => {
  const context = useContext(ClinicsContext);
  if (!context) {
    throw new Error("useClinics must be used within ClinicsProvider");
  }
  return context;
};

export const ClinicsProvider = ({ children }) => {
  const [clinics, setClinics] = useState([]);
  const [errors, setErrors] = useState([]);

  /* ================= GET ALL ================= */
  const getAllClinics = async () => {
    try {
      const res = await getClinics();
      const data = res.data?.data || [];
      setClinics(data);
      return { status: true, data };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || "Error fetching clinics"]);
      return { status: false };
    }
  };

  /* ================= GET BY ID ================= */
  const getClinicById = async (id) => {
    try {
      const res = await apiGetClinicById(id);
      return res.data?.data || res.data;
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || "Error fetching clinic"]);
      throw error;
    }
  };

  /* ================= CREATE ================= */
  const createNewClinic = async (data) => {
    try {
      const res = await createClinic(data);
      const created = res.data?.data || res.data;
      setClinics(prev => [...prev, created]);
      return created;
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || "Error creating clinic"]);
      throw error;
    }
  };

  /* ================= UPDATE ================= */
  const editedClinic = async (id, data) => {
    try {
      const res = await editClinic(id, data);
      const updated = res.data?.data || res.data;

      setClinics(prev =>
        prev.map(c => c.id === id ? updated : c)
      );

      return updated;
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || "Error updating clinic"]);
      throw error;
    }
  };

  /* ================= DELETE ================= */
  const deleteClinicById = async (id) => {
    try {
      await deleteClinic(id);
      setClinics(prev => prev.filter(c => c.id !== id));
      return { status: true };
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || "Error deleting clinic"]);
      throw error;
    }
  };


  return (
    <ClinicsContext.Provider
      value={{
        clinics,
        getAllClinics,
        getClinicById,
        createNewClinic,
        editedClinic,
        deleteClinicById,
        errors
      }}
    >
      {children}
    </ClinicsContext.Provider>
  );
};