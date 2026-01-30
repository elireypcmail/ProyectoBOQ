// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/product.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllProducts)
router.post("/", controller.createProduct)
router.get("/:id", controller.getProductById)
router.put("/:id", controller.updateProduct)
router.delete("/:id", controller.deleteProduct)
export default router
