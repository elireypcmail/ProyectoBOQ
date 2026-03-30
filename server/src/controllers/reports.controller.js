// controllers/Reports.controller.js
import { ReportsModel } from "../models/reports.model.js";

export const controller = {};

/* ================= Reports ================= */

// Obtener todos los reportes
controller.getAllReports = async (req, res) => {
  try {
    const result = await ReportsModel.getAllReports();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener reporte por ID
controller.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ error: "Report id required" });

    const result = await ReportsModel.getReportById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Crear reporte
controller.createReport = async (req, res) => {
  try {
    const data = req.body;

    console.log(data)

    if (!data.id_paciente)
      return res.status(400).json({
        error: "El cliente es obligatorio",
      });

    const result = await ReportsModel.createReports(data);
    console.log(result)

    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Actualizar reporte
controller.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id)
      return res.status(400).json({
        error: "El id del Report es requerido",
      });

    console.log(data);

    if (Object.keys(data).length === 0)
      return res.status(400).json({
        error: "No data to update",
      });

    const result = await ReportsModel.updateReport(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Eliminar (desactivar) reporte
controller.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({
        error: "Report id required",
      });

    const result = await ReportsModel.deleteReports(id);
    console.log(result)
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};