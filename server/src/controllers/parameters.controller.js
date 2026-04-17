import { Parameters } from "../models/parameters.model.js";
import { Images } from "../models/parameters.model.js";
import sharp from 'sharp'


export const controller = {};

/* ================= AUTH PARAMETROS ================= */
controller.loginParameter = async (req, res) => {
  try {
    const { contrasena } = req.body;

    console.log(req.body)

    if (!contrasena) {
      return res.status(400).json({ status: false, msg: "Contraseña es requerida" });
    }

    const response = await Parameters.verifyParametroClave(contrasena);

console.log("Login response:", response);

    return res.status(response.code || 200).json(response);
  } catch (error) {
    console.error("LOGIN PARAMETER ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al iniciar sesión", error: error.message });
  }
};

controller.regPasswordParameter = async (req, res) => {
  try {
    const { contraseña } = req.body;
    if (!contraseña) {
      return res.status(400).json({ status: false, msg: "Contraseña es requerida" });
    }

    const response = await Parameters.createParametroClave({ contrasena: contraseña });
    return res.status(response.code || 200).json(response);
  } catch (error) {
    console.error("REGISTER PASSWORD PARAMETER ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error interno del servidor", error: error.message });
  }
};

controller.updatePasswordParameter = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: false, msg: "Todas las contraseñas son requeridas" });
    }

    const response = await Parameters.updatePassword(oldPassword, newPassword);
    return res.status(response.code || 200).json(response);
  } catch (error) {
    console.error("UPDATE PASSWORD PARAMETER ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al actualizar contraseña", error: error.message });
  }
};

/* ================= PARAMETROS ================= */

controller.registerParameter = async (req, res) => {
  try {
    const data = req.body;
    if (!data.descripcion || !data.valor) {
      return res.status(400).json({ status: false, msg: "Descripción y valor son requeridos" });
    }

    console.log(data)

    const response = await Parameters.create(data);
    
    console.log(response)
    
    return res.status(response.code || 201).json(response);
  } catch (error) {
    console.error("REGISTER PARAMETER ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error interno del servidor", error: error.message });
  }
};

controller.getAllParameters = async (req, res) => {
  try {
    const response = await Parameters.getAll();
    return res.status(response.code || 200).json(response);
  } catch (error) {
    console.error("GET ALL PARAMETERS ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al obtener parámetros", error: error.message });
  }
};

controller.updateParameter = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ status: false, msg: "ID es requerido" });

    const response = await Parameters.update(id, data);
    return res.status(response.code || 200).json(response);
  } catch (error) {
    console.error("UPDATE PARAMETER ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al actualizar parámetro", error: error.message });
  }
};

controller.deleteParameter = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: false, msg: "ID es requerido" });

    const response = await Parameters.delete(id);
    return res.status(response.code || 200).json(response);
  } catch (error) {
    console.error("DELETE PARAMETER ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al eliminar parámetro", error: error.message });
  }
};

/* ================= IMAGENES ================= */

controller.getAllImages = async (req, res) => {
  try {
    const response = await Images.getAllImgParam();
    return res.status(response.code || 200).json(response);
  } catch (error) {
    console.error("GET ALL IMAGES ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al obtener imágenes", error: error.message });
  }
};

controller.registerImage = async (req, res) => {
  try {
    // 1. Support multiple files (depends on how you configured multer/express-fileupload)
    // If using multer with upload.array('files'), req.files will be an array.
    let files = req.files?.files || req.files || req.file;

    console.log(files)

    // Normalize to an array so we can loop through it easily
    if (!Array.isArray(files)) {
      if (files) files = [files];
      else files = [];
    }

    if (files.length === 0) {
      return res.status(400).json({ 
        status: false, 
        msg: "The files ('files') and names are required" 
      });
    }

    // 2. Extract the names from the JSON sent in the FormData
    let filesMetadata = [];
    if (req.body.files_json) {
      try {
        filesMetadata = JSON.parse(req.body.files_json);
      } catch (e) {
        console.warn("Error parsing files_json", e);
      }
    }

    const savedImages = [];

    // 3. Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Match the file with its corresponding name from the JSON
      const metadata = filesMetadata[i] || {};
      let imageNombre = metadata.nombre || `Image_Default_${i}`;

      let buffer = file.buffer || file.data;
      let fileName = file.originalname || file.name;
      let mimeType = file.mimetype;

      // --- Sharp Optimization ---
      if (mimeType.startsWith('image/')) {
        const optimizedBuffer = await sharp(buffer)
          .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();

        buffer = optimizedBuffer;
        fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
        mimeType = 'image/webp';
      }

      const imageData = {
        nombre: imageNombre,
        nombre_file: fileName,
        data: buffer,
        mime_type: mimeType
      };

      // Save to database
      const response = await Images.createImgParam(imageData);
      savedImages.push(response);
    }
    
    return res.status(201).json({
      status: true,
      msg: "Images optimized to WebP and registered successfully",
      data: savedImages
    });

  } catch (error) {
    console.error("❌ REGISTER IMAGE ERROR:", error);
    // Returning structured JSON error message instead of raw error
    return res.status(500).json({ 
      status: false, 
      msg: "Internal error processing the images", 
      error: error.message 
    });
  }
};

controller.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: false, msg: "ID es requerido" });
    const { nombre } = req.body;

    console.log(req.body)

    // Soporta tanto req.file (single) como req.files (array/fields)
    const file = req.file || (req.files && (req.files.image || req.files.files));

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    
    if (file) {
      let buffer = file.buffer || file.data;
      let fileName = file.originalname || file.name;
      let mimeType = file.mimetype;

      // --- Sharp Optimization (Igual que en register) ---
      if (mimeType.startsWith('image/')) {
        const optimizedBuffer = await sharp(buffer)
          .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();

        buffer = optimizedBuffer;
        // Cambiamos extensión a .webp
        fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
        mimeType = 'image/webp';
      }

      updateData.nombre_file = fileName;
      updateData.data = buffer;
      updateData.mime_type = mimeType;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ status: false, msg: "No hay datos para actualizar" });
    }

    const response = await Images.updateImgParam(id, updateData);
    return res.status(response.code || 200).json(response);

  } catch (error) {
    console.error("❌ UPDATE IMAGE ERROR:", error);
    return res.status(500).json({ 
      status: false, 
      msg: "Error interno al procesar la actualización", 
      error: error.message 
    });
  }
};

controller.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: false, msg: "ID es requerido" });

    const response = await Images.deleteImgParam(id);
    return res.status(response.code || 200).json(response);
  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al eliminar imagen", error: error.message });
  }
};