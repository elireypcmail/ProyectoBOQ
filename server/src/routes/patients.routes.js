// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/patients.controller.js"
// Middleware
import { upload } from "../middlewares/upload.js"

/* ================= Routes ================= */
router.get("/", controller.getAllPatients)
router.post("/", controller.createPatients)
router.get("/:id", controller.getByIdPatients)
router.put("/:id", controller.updatePatients)
router.delete("/:id", controller.deletePatients)

export default router
