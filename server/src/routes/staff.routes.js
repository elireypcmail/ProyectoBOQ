// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/doctor.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllStaff)
router.post("/", controller.createStaff)
router.get("/:id", controller.getByIdStaff)
router.put("/:id", controller.updateStaff)
router.delete("/:id", controller.deleteStaff)


export default router
