// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/clinics.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllClinics)
router.post("/", controller.createClinic)
router.get("/:id", controller.getClinicById)
router.put("/:id", controller.updateClinic)
router.delete("/:id", controller.deleteClinic)

export default router
