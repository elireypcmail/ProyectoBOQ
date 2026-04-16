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
router.post("/login", controller.login)
router.post("/logout", controller.logout)
router.get("/verify", controller.verifyToken)

/* ================= USUARIOS ================= */
router.post("/register", controller.register)
router.get("/usuarios", controller.getAllUsers)
router.get("/usuarios/:id", controller.getUserById)
router.put("/usuarios/:id", controller.updateUser)
router.delete("/usuarios/:id", controller.setStatus)

/* ================= ROLES ================= */
router.get("/roles", controller.getAllRoles)
router.post("/roles", controller.registerRole)
router.put("/roles/:id", controller.updateRole)
router.delete("/roles/:id", controller.deleteRole)

/* ================= ENTIDADES ================= */
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
