// controllers/transfers.controller.js
import { TransfersModel } from "../models/transfers.model.js";

export const controllerTransfers = {};

controllerTransfers.createTrasladoInv = async (req, res) => {
  try {
    const data = req.body;

    console.log(data);

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return res.status(400).json({
        status: false,
        msg: "Debe enviar al menos un ítem en el traslado.",
      });
    }

    for (const [i, item] of data.items.entries()) {
      const required = [
        "id_producto_origen",
        "id_deposito_origen",
        "id_producto_destino",
        "id_deposito_destino",
        "cantidad",
      ];
      const missing = required.filter((k) => item[k] === undefined || item[k] === null);
      if (missing.length > 0) {
        return res.status(400).json({
          status: false,
          msg: `Ítem #${i + 1}: faltan campos obligatorios → ${missing.join(", ")}`,
        });
      }
      if (
        item.id_producto_origen === item.id_producto_destino &&
        item.id_deposito_origen === item.id_deposito_destino
      ) {
        return res.status(400).json({
          status: false,
          msg: `Ítem #${i + 1}: el origen y destino no pueden ser el mismo producto y depósito.`,
        });
      }
    }

    const result = await TransfersModel.createTraslado(data);
    return res.status(result.code).json(result);

  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};

controllerTransfers.getTrasladosInv = async (req, res) => {
  try {
    const result = await TransfersModel.getTraslados();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};