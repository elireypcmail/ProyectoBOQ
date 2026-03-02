// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/product.controller.js"
// Middleware
import { upload } from "../middlewares/upload.js"


/* ================= Routes ================= */
router.get("/", controller.getAllProducts)
router.post("/", controller.createProduct)
router.get("/:id", controller.getProductById)
router.put("/:id", controller.updateProduct)
router.delete("/:id", controller.deleteProduct)

router.post("/save/file/:id", upload.array("files"), controller.save_newFiles)

// Auditoria Precios
router.get("/auditoria/precio/:id", controller.getProductAud)

// Kardex General
router.get("/kardex/:id", controller.getProductKardex)
router.get("/kardex/deposito/:id/:id_deposito", controller.getProductKardexDep)

// Depositos - EDepositos
router.get("/deposito/existencias/:id", controller.getProductEdeposit)
router.post("/deposito/existencias/:id", controller.createProductEdeposit)
router.put("/deposito/existencias/:id", controller.editProductEdeposit)
router.delete("/deposito/existencias/:id", controller.deleteProductEdeposit)


export default router
