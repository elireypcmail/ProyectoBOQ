// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/patients.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllInsurances)
router.post("/", controller.createInsurances)
router.get("/:id", controller.getByIdInsurances)
router.put("/:id", controller.updateInsurances)
router.delete("/:id", controller.deleteInsurances)

export default router
