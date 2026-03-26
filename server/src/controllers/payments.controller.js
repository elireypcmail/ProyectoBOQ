// controllers/Payments.controller.js
import { PaymentsModel } from "../models/payments.model.js";

export const controller = {};

controller.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)

    if (!id) return res.status(400).json({ error: "Payment id required" });

    const result = await PaymentsModel.getPaymentsById(id);
    console.log(result)
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createPayment = async (req, res) => {
  try {
    const data = req.body;

    const result = await PaymentsModel.createPayment(data);
    console.log(result)

    return res.status(result.code).json(result);

  } catch (error) {
    console.error("Error en controller.createPayment:", error);
    return res.status(500).json({ status: false, error: error.message });
  }
};

controller.updatePayment = async (req, res) => {
  try {
    const {id} = req.params;
    const data = req.body;

    console.log(data)

    const result = await PaymentsModel.editPayment(id, data);
    console.log(result)

    return res.status(result.code).json(result);

  } catch (error) {
    console.error("Error en controller.editPayment:", error);
    return res.status(500).json({ status: false, error: error.message });
  }
};

controller.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Payment id required" });

    const result = await PaymentsModel.deletePayment(id);
    return res.status(result.code).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};