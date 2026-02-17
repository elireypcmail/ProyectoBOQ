// controllers/inventario.controller.js
import { ShoppingModel } from "../models/shopping.model.js";

export const controller = {};

/* ================= PRODUCTOS ================= */
controller.getAllShoping = async (req, res) => {
  try {
    const result = await ShoppingModel.getAllShoping();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.getShoppingById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id)

    if (!id) return res.status(400).json({ error: "Product id required" });

    const result = await ShoppingModel.getShoppingById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createShopping = async (req, res) => {
  try {
    const data = req.body;

    console.log(data)

    // Validaciones de datos obligatorios para el flujo de compra (Punto 2.2 - 2)
    if (!data.id_proveedor || !data.nro_factura || !data.items) {
      return res.status(400).json({ 
        status: false, 
        msg: "Proveedor, Número de factura, Depósito y Productos son obligatorios." 
      });
    }

    const result = await ShoppingModel.createShopping(data);
    return res.status(result.code).json(result);

  } catch (error) {
    console.error("Error en controller.createShopping:", error);
    return res.status(500).json({ status: false, error: error.message });
  }
};

controller.updateShopping = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ error: "El id del producto es requerido" });
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "No data to update" });

    const result = await ShoppingModel.updateShopping(id, data);
    console.log(result)
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteShopping = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product id required" });

    const result = await ShoppingModel.deleteShopping(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};