// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/doctor.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllDoctorTypes)
router.post("/", controller.createDoctorTypes)
router.get("/:id", controller.getByIdDoctorTypes)
router.put("/:id", controller.updateDoctorTypes)
router.delete("/:id", controller.deleteDoctorTypes)


export default router
