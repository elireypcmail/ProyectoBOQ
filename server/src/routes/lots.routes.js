// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/product.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllLotes)
router.post("/", controller.createLote)
router.get("/:id", controller.getLoteById)
router.get("/producto/:id", controller.getLoteProductoById)
router.put("/:id", controller.updateLote)
router.delete("/:id", controller.deleteLote)

export default router
