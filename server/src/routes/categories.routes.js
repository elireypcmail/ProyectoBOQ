// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/product.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllCategories)
router.post("/", controller.createCategory)
router.get("/:id", controller.getCategoryById)
router.put("/:id", controller.updateCategory)
router.delete("/:id", controller.deleteCategory)
export default router
