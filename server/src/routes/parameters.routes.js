// Express
import { Router } from "express"
const router = Router()
// Controllers
import { controller } from "../controllers/parameters.controller.js"
// Middleware
import { upload } from "../middlewares/upload.js"

/* ================= AUTH PARAMETROS ================= */
router.post("/auth/login", controller.loginParameter)
router.post("/auth", controller.regPasswordParameter)
router.put("/auth/update", controller.updatePasswordParameter)


/* ================= PARAMETROS ================= */
router.post("/", controller.registerParameter)
router.get("/", controller.getAllParameters)
router.put("/:id", controller.updateParameter)
router.delete("/:id", controller.deleteParameter)

/* ================= IMAGENES ================= */
router.get("/images", controller.getAllImages)
router.post("/images", upload.array("files"), controller.registerImage)
router.put("/images/:id", upload.array("files"), controller.updateImage)
router.delete("/images/:id", controller.deleteImage)

export default router
