// Express
import { Router } from "express"
const router = Router()
// Environment
import _var from "../global/_var.js"
// Controllers
import { controller } from "../controllers/product.controller.js"

/* ================= Routes ================= */
router.get("/", controller.getAllProducts)
router.post("/", controller.createProduct)
router.get("/:id", controller.getProductById)
router.put("/:id", controller.updateProduct)
router.delete("/:id", controller.deleteProduct)

// Depositos - EDepositos
router.get("/deposito/existencias/:id", controller.getProductEdeposit)
router.post("/deposito/existencias/:id", controller.createProductEdeposit)
router.put("/deposito/existencias/:id", controller.editProductEdeposit)
router.delete("/deposito/existencias/:id", controller.deleteProductEdeposit)

// Inventario
router.get("/inventario/:id", controller.getAllInventory)
router.post("/inventario", controller.createInventory)
router.put("/inventario/:id", controller.updateInventory)
router.delete("/inventario/:id", controller.deleteInventory)



export default router
