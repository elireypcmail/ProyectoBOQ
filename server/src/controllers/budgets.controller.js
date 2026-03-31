// controllers/Budgets.controller.js
import { BudgetsModel } from "../models/budgets.model.js";

export const controller = {};

/* ================= Budgets ================= */

// Obtener todos los presupuestos
controller.getAllBudgets = async (req, res) => {
  try {
    const result = await BudgetsModel.getAllBudgets();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener presupuesto por ID
controller.getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ error: "Budget id required" });

    const result = await BudgetsModel.getBudgetById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Crear presupuesto
controller.createBudget = async (req, res) => {
  try {
    const data = req.body;

    console.log(data)

    if (!data.id_paciente)
      return res.status(400).json({
        error: "El cliente es obligatorio",
      });

    const result = await BudgetsModel.createBudgets(data);
    console.log(result)

    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Actualizar presupuesto
controller.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id)
      return res.status(400).json({
        error: "El id del budget es requerido",
      });

    console.log(data);

    if (Object.keys(data).length === 0)
      return res.status(400).json({
        error: "No data to update",
      });

    const result = await BudgetsModel.updateBudget(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Usar Presupuesto
controller.useBudget = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({
        error: "Budget id required",
      });

    const result = await BudgetsModel.useBudgets(id);
    console.log(result)
    
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Eliminar (desactivar) presupuesto
controller.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({
        error: "Budget id required",
      });

    const result = await BudgetsModel.deleteBudgets(id);
    console.log(result)
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};