// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/suppliers.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllSuppliers)
router.post("/", controller.createSupplier)
router.put("/:id", controller.updateSupplier)
router.delete("/:id", controller.deleteSupplier)

export default router
