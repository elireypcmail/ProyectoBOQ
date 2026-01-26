// Express
import { Router } from "express"
const router = Router()

// Environment
import _var from "../global/_var.js"

// Controllers
import { controller } from "../controllers/auth.controller.js"
import { controllerEnt } from "../controllers/entitiesUser.controller.js"

// Schemas
import { validateSchema } from "../middlewares/validator.middlewares.js"
import { loginSchema } from "../schemas/auth.schema.js"

/* ================= AUTH ================= */
// router.post(_var.LOGIN, validateSchema(loginSchema), controller.login)
router.post(_var.LOGIN, controller.login)
router.post(_var.REGISTER, controller.register)
router.post(_var.LOGOUT, controller.logout)
router.get(_var.VERIFY, controller.verifyToken)

/* ================= ENTITIES USER ================= */
/*
  Entidades soportadas:
  - offices
  - zones
  - deposits
  - parameters
*/
router.get("/:table", controllerEnt.getAll)
router.post("/:table", controllerEnt.create)
router.get("/:table/:id", controllerEnt.getById)
router.put("/:table/:id", controllerEnt.update)
router.delete("/:table/:id", controllerEnt.delete)

export default router
