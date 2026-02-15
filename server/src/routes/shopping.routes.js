// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/shopping.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllShoping)
router.post("/", controller.createShopping)
router.get("/:id", controller.getShoppingById)
router.put("/:id", controller.updateShopping)
router.delete("/:id", controller.deleteShopping)

export default router
