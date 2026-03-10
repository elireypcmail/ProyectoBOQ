// controllers/sales.controller.js
import { SalesModel } from "../models/sales.model.js";

export const controller = {};

/* ================= VENTAS ================= */

controller.getAllSales = async (req, res) => {
  try {
    const result = await SalesModel.getAllSales();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)

    if (!id) return res.status(400).json({ error: "Sale id required" });

    const result = await SalesModel.getSaleById(id);
    console.log(result)
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createSale = async (req, res) => {
  try {
    const data = req.body;

    console.log(data)
    console.log(data.items)

    // Validaciones de datos obligatorios para el flujo de venta
    // if (!data.id_paciente || !data.nro_factura || !data.items) {
    //   return res.status(400).json({ 
    //     status: false, 
    //     msg: "Paciente, Número de factura y Productos son obligatorios." 
    //   });
    // }

    const result = await SalesModel.createSale(data);
    console.log(result)

    return res.status(result.code).json(result);

  } catch (error) {
    console.error("Error en controller.createSale:", error);
    return res.status(500).json({ status: false, error: error.message });
  }
};

controller.updateSale = async (req, res) => {
  try {
    const {id} = req.params;
    const data = req.body;

    console.log(data)

    // Validaciones de datos obligatorios para el flujo de venta
    // if (!data.id_paciente || !data.nro_factura || !data.items) {
    //   return res.status(400).json({ 
    //     status: false, 
    //     msg: "Paciente, Número de factura y Productos son obligatorios." 
    //   });
    // }

    const result = await SalesModel.editSale(id, data);
    console.log(result)

    return res.status(result.code).json(result);

  } catch (error) {
    console.error("Error en controller.editSale:", error);
    return res.status(500).json({ status: false, error: error.message });
  }
};


controller.confirmSale = async (req, res) => {
  try {
    const { id } = req.params;
    // const data = req.body;

    console.log(id)

    if (!id) return res.status(400).json({ error: "El id de la venta es requerido" });
    // if (Object.keys(data).length === 0) return res.status(400).json({ error: "No data to update" });

    const result = await SalesModel.confirmSale(id);
    console.log(result)
    return res.status(result.code).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Sale id required" });

    const result = await SalesModel.deleteSale(id);
    return res.status(result.code).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};