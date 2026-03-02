// Model único
import { SellersModel } from "../models/sellers.model.js";
import sharp from "sharp";

export const controller = {};

// ================= VENDEDORES =================

// Obtener todos
controller.getAllSellers = async (req, res) => {
  try {
    const result = await SellersModel.getAllSellers();
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Obtener por ID
controller.getSellerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SellersModel.getSellerById(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Crear vendedor
controller.createSeller = async (req, res) => {
  try {
    const {
      nombre,
      telefono,
      email,
      id_oficina,
      id_zona,
      comision,
      estatus
    } = req.body;

    // 🔎 Validaciones mínimas
    if (!nombre) {
      return res.status(400).json({
        error: "El nombre es obligatorio"
      });
    }

    if (!id_oficina || !id_zona) {
      return res.status(400).json({
        error: "Oficina y zona son obligatorias"
      });
    }

    if (comision == null) {
      return res.status(400).json({
        error: "La comisión es obligatoria"
      });
    }

    console.log(req.body)

    const result = await SellersModel.createSeller({
      nombre,
      telefono,
      email,
      id_oficina,
      id_zona,
      comision,
      estatus
    });

    console.log(result)

    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Actualizar vendedor
controller.updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ error: "Seller id required" });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const result = await SellersModel.updateSeller(id, data);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Eliminar vendedor (soft o hard según el model)
controller.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SellersModel.deleteSeller(id);
    return res.status(result.code).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ================= IMÁGENES VENDEDORES =================
// (Solo si vas a manejar archivos también para vendedores)

controller.save_newFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    const filesJson = JSON.parse(req.body.files_json || "[]");

    let savedFiles = [];
    let savedOrders = null;

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.mimetype.startsWith("image/")) {
          const optimizedBuffer = await sharp(file.buffer)
            .resize(1200, null, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();

          return {
            ...file,
            buffer: optimizedBuffer,
            originalname:
              file.originalname.replace(/\.[^/.]+$/, "") + ".webp",
            mimetype: "image/webp",
          };
        }
        return file;
      })
    );

    if (processedFiles.length > 0) {
      const insertedResult = await SellersModel.saveImages(id, processedFiles);

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

    const sellerData = await SellersModel.getSellerById(id);
    const existingFiles = sellerData?.files || [];

    const keepIds = filesJson.map((f) => f.id).filter((id) => id != null);

    const idsToDelete = existingFiles
      .map((f) => f.id)
      .filter((id) => id != null && !keepIds.includes(id));

    if (idsToDelete.length > 0) {
      await SellersModel.deleteFilesById(idsToDelete);
    }

    const finalFiles = filesJson
      .filter((f) => f.id != null)
      .sort((a, b) => a.order - b.order)
      .map((f, i) => ({
        id: f.id,
        name: f.name,
        order: i + 1,
      }));

    savedOrders = await SellersModel.orderFiles(id, finalFiles);

    return res.status(201).json({
      code: 201,
      message:
        "Procesado con éxito. Imágenes optimizadas a WebP y orden actualizado.",
      savedFiles,
      savedOrders,
    });
  } catch (error) {
    console.error("❌ Error en save_newFiles:", error);
    return res.status(500).json({
      code: 500,
      error: error.message,
    });
  }
};