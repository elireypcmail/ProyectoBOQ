// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/sellers.controller.js"
// Middlwares
// import { upload } from "../middlewares/upload.js"

/* ================= Routes ================= */
router.get("/", controller.getAllSellers)
router.post("/", controller.createSeller)
router.put("/:id", controller.updateSeller)
router.delete("/:id", controller.deleteSeller)
// router.post("/save/file/:id", upload.array("files"), controller.save_newFiles)

export default router
