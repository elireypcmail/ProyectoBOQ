// controllers/Clinics.controller.js
import { ClinicsModel } from "../models/clinics.model.js";

export const controller = {};

/* ================= Clinics ================= */

// Obtener todas las clínicas
controller.getAllClinics = async (req, res) => {
  try {
    const result = await ClinicsModel.getAllClinics();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener clínica por ID
controller.getClinicById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ error: "Clinic id required" });

    const result = await ClinicsModel.getClinicById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// Crear clínica
controller.createClinic = async (req, res) => {
  try {
    const data = req.body;

    if (!data.nombre || !data.direccion)
      return res.status(400).json({
        error: "nombre y direccion son obligatorios",
      });

    const result = await ClinicsModel.createClinic(data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Actualizar clínica
controller.updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id)
      return res.status(400).json({
        error: "El id de la clinic es requerido",
      });

    console.log(data)

    if (Object.keys(data).length === 0)
      return res.status(400).json({
        error: "No data to update",
      });

    const result = await ClinicsModel.updateClinic(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Eliminar (desactivar) clínica
controller.deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({
        error: "Clinic id required",
      });

    const result = await ClinicsModel.deleteClinic(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};