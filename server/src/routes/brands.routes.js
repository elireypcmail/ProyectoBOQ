// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/product.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllBrands)
router.post("/", controller.createBrand)
router.get("/:id", controller.getBrandById)
router.put("/:id", controller.updateBrand)
router.delete("/:id", controller.deleteBrand)

export default router
