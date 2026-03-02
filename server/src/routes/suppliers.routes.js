// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/suppliers.controller.js"
// Middlwares
import { upload } from "../middlewares/upload.js"

/* ================= Routes ================= */
router.get("/", controller.getAllSuppliers)
router.post("/", controller.createSupplier)
router.put("/:id", controller.updateSupplier)
router.delete("/:id", controller.deleteSupplier)
router.post("/save/file/:id", upload.array("files"), controller.save_newFiles)

export default router
