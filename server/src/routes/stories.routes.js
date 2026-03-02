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
router.get("/", controller.getAllStories)
router.post("/", controller.createStories)
router.get("/:id", controller.getByIdStories)
router.get("/paciente/:id", controller.getPatientByIdStories)
router.put("/:id", controller.updateStories)
router.delete("/:id", controller.deleteStories)
router.post("/save/file/:id", upload.array("files"), controller.saveFilesHistory)

export default router
