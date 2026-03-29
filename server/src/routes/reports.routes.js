// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/reports.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllReports)
router.post("/", controller.createReport)
router.get("/:id", controller.getReportById)
router.put("/:id", controller.updateReport)
router.delete("/:id", controller.deleteReport)

export default router
