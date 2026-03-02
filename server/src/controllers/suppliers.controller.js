// Model único
import { SuppliersModel } from "../models/suppliers.model.js";
import sharp from 'sharp'

export const controller = {};

// ================= PROVEEDORES =================

// Obtener todos
controller.getAllSuppliers = async (req, res) => {
  try {
    const result = await SuppliersModel.getAllSuppliers();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener por ID
controller.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SuppliersModel.getSupplierById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Crear proveedor
controller.createSupplier = async (req, res) => {
  try {
    const {
      nombre,
      documento,
      telefono,
      email,
      datos_bancarios,
      estatus
    } = req.body;

    // 🔎 Validaciones mínimas
    if (!nombre) {
      return res.status(400).json({
        error: "El nombre es obligatorio"
      });
    }

    console.log(req.body)

    const result = await SuppliersModel.createSupplier({
      nombre,
      documento,
      telefono,
      email,
      datos_bancarios,
      estatus
    });

    console.log(result)

    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Actualizar proveedor
controller.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ error: "Supplier id required" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const result = await SuppliersModel.updateSupplier(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Eliminar proveedor (soft o hard según el model)
controller.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SuppliersModel.deleteSupplier(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

controller.save_newFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    const filesJson = JSON.parse(req.body.files_json || "[]");

    console.log(id)
    console.log(filesJson)

    let savedFiles = [];
    let savedOrders = null;

    const processedFiles = await Promise.all(files.map(async (file) => {
      if (file.mimetype.startsWith('image/')) {
        const optimizedBuffer = await sharp(file.buffer)
          .resize(1200, null, { 落: true, withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();

        return {
          ...file,
          buffer: optimizedBuffer,
          originalname: file.originalname.replace(/\.[^/.]+$/, "") + ".webp",
          mimetype: 'image/webp'
        };
      }
      return file;
    }));

    if (processedFiles.length > 0) {
      const insertedResult = await SuppliersModel.saveImages(id, processedFiles);

      if (!insertedResult.status) {
        return res.status(500).json(insertedResult);
      }

      const inserted = insertedResult.data;
      savedFiles = insertedResult;

      let idx = 0;
      for (let i = 0; i < filesJson.length; i++) {
        if (filesJson[i].id == null && inserted[idx]) {
          filesJson[i].id = inserted[idx].id;
          filesJson[i].name = inserted[idx].name_file;
          idx++;
        }
      }
    }

    const supplierData = await SuppliersModel.getSupplierById(id); 
    const existingFiles = supplierData?.files || [];

    const keepIds = filesJson.map(f => f.id).filter(id => id != null);
    
    const idsToDelete = existingFiles
      .map(f => f.id)
      .filter(id => id != null && !keepIds.includes(id));

    if (idsToDelete.length > 0) {
      await SuppliersModel.deleteFilesById(idsToDelete);
    }

    const finalFiles = filesJson
      .filter(f => f.id != null)
      .sort((a, b) => a.order - b.order)
      .map((f, i) => ({
        id: f.id,
        name: f.name,
        order: i + 1,
      }));

    savedOrders = await SuppliersModel.orderFiles(id, finalFiles);

    return res.status(201).json({
      code: 201,
      message: "Procesado con éxito. Imágenes optimizadas a WebP y orden actualizado.",
      savedFiles,
      savedOrders,
    });

  } catch (error) {
    console.error("❌ Error en save_newFiles:", error);
    return res.status(500).json({ 
      code: 500,
      error: error.message 
    });
  }
};