// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/doctor.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllDoctors)
router.post("/", controller.createDoctors)
router.get("/:id", controller.getByIdDoctors)
router.put("/:id", controller.updateDoctors)
router.delete("/:id", controller.deleteDoctors)

export default router
