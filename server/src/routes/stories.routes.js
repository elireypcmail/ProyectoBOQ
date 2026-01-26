// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/patients.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllStories)
router.post("/", controller.createStories)
router.get("/:id", controller.getByIdStories)
router.put("/:id", controller.updateStories)
router.delete("/:id", controller.deleteStories)

export default router
