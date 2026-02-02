// controllers/inventario.controller.js
import { ProductsModel } from "../models/product.model.js";

export const controller = {};

/* ================= PRODUCTOS ================= */
controller.getAllProducts = async (req, res) => {
  try {
    const result = await ProductsModel.getAllProducts();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id)

    if (!id) return res.status(400).json({ error: "Product id required" });

    const result = await ProductsModel.getProductById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createProduct = async (req, res) => {
  try {
    const { descripcion, id_categoria, id_marca, files, estatus } = req.body;
    if (!descripcion || !id_categoria || !id_marca)
      return res.status(400).json({ error: "descripcion, id_categoria y id_marca son obligatorios" });

    const result = await ProductsModel.createProduct({ descripcion, id_categoria, id_marca, files, estatus });
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ error: "Product id required" });
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "No data to update" });

    const result = await ProductsModel.updateProduct(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product id required" });

    const result = await ProductsModel.deleteProduct(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ================= PRODUCTOS IMAGES ================= */
controller.addProductImage = async (req, res) => {
  try {
    const { product_id, nombre_file, data, mime_type, is_main } = req.body;
    if (!product_id || !data || !mime_type)
      return res.status(400).json({ error: "product_id, data y mime_type son obligatorios" });

    const result = await ProductsModel.addProductImage({ product_id, nombre_file, data, mime_type, is_main });
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Image id required" });

    const result = await ProductsModel.deleteProductImage(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ================= PRODUCTOS CON EXISTENCIAS EN DEPOSITO ================= */
controller.getProductEdeposit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Product id required" });

    const result = await ProductsModel.getProductWithDeposits(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createProductEdeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_deposito, existencia_deposito, stock_minimo_deposito } = req.body;

    if (!id || !id_deposito || existencia_deposito == null || stock_minimo_deposito == null)
      return res.status(400).json({ error: "Required fields missing" });

    const result = await ProductsModel.createEdeposit({
      id_producto: id,
      id_deposito,
      existencia_deposito,
      stock_minimo_deposito
    });

    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

controller.editProductEdeposit = async (req, res) => {
  try {
    const { id } = req.params; // id del producto
    const { id_deposito, existencia_deposito, stock_minimo_deposito } = req.body;

    if (!id || !id_deposito) return res.status(400).json({ error: "Product and deposit IDs required" });

    const result = await ProductsModel.editEdeposit({
      id_producto: id,
      id_deposito,
      existencia_deposito,
      stock_minimo_deposito
    });

    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

controller.deleteProductEdeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_deposito } = req.body;

    if (!id || !id_deposito) return res.status(400).json({ error: "Product and deposit IDs required" });

    const result = await ProductsModel.deleteEdeposit(id, id_deposito);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

/* ================= CATEGORIAS ================= */
controller.getAllCategories = async (req, res) => {
  try {
    const result = await ProductsModel.getAllCategories();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Category id required" });

    const result = await ProductsModel.getCategoryById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createCategory = async (req, res) => {
  try {
    const { nombre, estatus } = req.body;
    if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });

    console.log(req.body)

    const result = await ProductsModel.createCategory({ nombre, estatus });
    console.log(result)

    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ error: "Category id required" });
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "No data to update" });

    const result = await ProductsModel.updateCategory(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Category id required" });

    const result = await ProductsModel.deleteCategory(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ================= MARCAS ================= */
controller.getAllBrands = async (req, res) => {
  try {
    const result = await ProductsModel.getAllBrands();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Brand id required" });

    const result = await ProductsModel.getBrandById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createBrand = async (req, res) => {
  try {
    const { nombre, estatus } = req.body;
    if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });

    const result = await ProductsModel.createBrand({ nombre, estatus });
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ error: "Brand id required" });
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "No data to update" });

    const result = await ProductsModel.updateBrand(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Brand id required" });

    const result = await ProductsModel.deleteBrand(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ================= LOTES ================= */
controller.getAllLotes = async (req, res) => {
  try {
    const result = await ProductsModel.getAllLotes();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.getLoteById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Lote id required" });

    const result = await ProductsModel.getLoteById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.getLoteProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Lote id required" });

    const result = await ProductsModel.getLotesProductoById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createLote = async (req, res) => {
  try {
    const { id_producto, nro_lote, fecha_vencimiento, estatus = true } = req.body;

    console.log(req.body)

    if (!id_producto || !nro_lote) return res.status(400).json({ error: "id_producto y nro_lote son obligatorios" });

    const result = await ProductsModel.createLote({ id_producto, nro_lote, fecha_vencimiento, estatus });
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.updateLote = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ error: "Lote id required" });
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "No data to update" });

    const result = await ProductsModel.updateLote(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteLote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Lote id required" });

    const result = await ProductsModel.deleteLote(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ================= INVENTARIO ================= */
controller.getAllInventory = async (req, res) => {
  try {
    const {id} = req.params
    if (!id) return res.status(400).json({ error: "producto id required" });

    const result = await ProductsModel.getAllInventory(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createInventory = async (req, res) => {
  try {
    // const {id} = req.params
    const { id_lote, id_oficina, nro_serie, existencia_general, costo_unitario, precio_venta, margen_ganancia, stock_minimo_general, estatus } = req.body;
    console.log(req.body)
    if (!id_lote || !id_oficina || existencia_general == null || costo_unitario == null || precio_venta == null || margen_ganancia == null || stock_minimo_general == null)
      return res.status(400).json({ error: "Campos obligatorios incompletos" });

    const result = await ProductsModel.createInventory({ id_lote, id_oficina, nro_serie, existencia_general, costo_unitario, precio_venta, margen_ganancia, stock_minimo_general, estatus });
    console.log(result)
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ error: "Inventory id required" });
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "No data to update" });

    const result = await ProductsModel.updateInventory(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Inventory id required" });

    const result = await ProductsModel.deleteInventory(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ================= EDEPOSITO ================= */
controller.getAllDeposits = async (req, res) => {
  try {
    const result = await ProductsModel.getAllDeposits();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createDeposit = async (req, res) => {
  try {
    const { id_producto, id_deposito, existencia_deposito, stock_minimo_deposito, estatus } = req.body;
    if (!id_producto || !id_deposito || existencia_deposito == null || stock_minimo_deposito == null)
      return res.status(400).json({ error: "Campos obligatorios incompletos" });

    const result = await ProductsModel.createDeposit({ id_producto, id_deposito, existencia_deposito, stock_minimo_deposito, estatus });
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.updateDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ error: "Deposit id required" });
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "No data to update" });

    const result = await ProductsModel.updateDeposit(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.deleteDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Deposit id required" });

    const result = await ProductsModel.deleteDeposit(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ================= KARDEX GENERAL ================= */
controller.getAllKardexG = async (req, res) => {
  try {
    const result = await ProductsModel.getAllKardexG();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createKardexG = async (req, res) => {
  try {
    const { id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo, estatus } = req.body;
    if (!id_producto || !fecha || existencia_inicial == null || entrada == null || salida == null || existencia_final == null || costo == null || precio == null || !detalle || !documento || !tipo)
      return res.status(400).json({ error: "Campos obligatorios incompletos" });

    const result = await ProductsModel.createKardexG({ id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo, estatus });
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ================= KARDEX DEPOSITO ================= */
controller.getAllKardexDep = async (req, res) => {
  try {
    const result = await ProductsModel.getAllKardexDep();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.createKardexDep = async (req, res) => {
  try {
    const { id_producto, id_deposito, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo, estatus } = req.body;
    if (!id_producto || !id_deposito || !fecha || existencia_inicial == null || entrada == null || salida == null || existencia_final == null || costo == null || precio == null || !detalle || !documento || !tipo)
      return res.status(400).json({ error: "Campos obligatorios incompletos" });

    const result = await ProductsModel.createKardexDep({ id_producto, id_deposito, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo, estatus });
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
