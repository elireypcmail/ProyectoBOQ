// Express
import { Router } from "express"
const router = Router()
// Controllers
import { controller } from "../controllers/payments.controller.js"

/* ================= Routes ================= */
router.get("/:id", controller.getPaymentById)
router.post("/", controller.createPayment)
router.put("/:id", controller.updatePayment)
router.delete("/:id", controller.deletePayment)

export default router
