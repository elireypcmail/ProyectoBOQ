// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/budgets.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllBudgets)
router.post("/", controller.createBudget)
router.get("/:id", controller.getBudgetById)
router.put("/use/:id", controller.useBudget)
router.put("/export/:id", controller.exportBudget)
router.put("/:id", controller.updateBudget)
router.delete("/:id", controller.deleteBudget)

export default router
