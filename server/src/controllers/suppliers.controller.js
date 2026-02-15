// Model único
import { SuppliersModel } from "../models/suppliers.model.js";

export const controller = {};

// ================= PROVEEDORES =================

// Obtener todos
controller.getAllSuppliers = async (req, res) => {
  try {
    const result = await SuppliersModel.getAllSuppliers();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener por ID
controller.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SuppliersModel.getSupplierById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Crear proveedor
controller.createSupplier = async (req, res) => {
  try {
    const {
      nombre,
      documento,
      telefono,
      email,
      estatus
    } = req.body;

    // 🔎 Validaciones mínimas
    if (!nombre) {
      return res.status(400).json({
        error: "El nombre es obligatorio"
      });
    }

    const result = await SuppliersModel.createSupplier({
      nombre,
      documento,
      telefono,
      email,
      estatus
    });

    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Actualizar proveedor
controller.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ error: "Supplier id required" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const result = await SuppliersModel.updateSupplier(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Eliminar proveedor (soft o hard según el model)
controller.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SuppliersModel.deleteSupplier(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
