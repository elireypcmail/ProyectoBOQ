// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/sales.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllSales)
router.post("/", controller.createSale)
router.put("/:id", controller.updateSale)
router.put("/confirmar/:id", controller.confirmSale)
router.get("/:id", controller.getSaleById)
router.delete("/:id", controller.deleteSale)

export default router
