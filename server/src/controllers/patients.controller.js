// Model único
import { PatientsModel } from "../models/patients.model.js"
import sharp from 'sharp'

export const controller = {}

/* ================= PACIENTES ================= */

controller.getAllPatients = async (req, res) => {
  try {
    const result = await PatientsModel.getAllPatients()
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.getByIdPatients = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: "Patient id required" })
    }

    const result = await PatientsModel.getPatientById(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.createPatients = async (req, res) => {
  try {
    const {
      id_seguro,
      nombre,
      documento,
      telefono,
      email,
      files,
      estatus
    } = req.body

    if (!nombre || !documento) {
      return res.status(400).json({
        error: "Nombre y documento son obligatorios"
      })
    }

    const result = await PatientsModel.createPatient({
      id_seguro,
      nombre,
      documento,
      telefono,
      email,
      files,
      estatus
    })

    console.log(result)

    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.updatePatients = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    if (!id) {
      return res.status(400).json({ error: "Patient id required" })
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data to update" })
    }

    const result = await PatientsModel.updatePatient(id, data)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.deletePatients = async (req, res) => {
  try {
    const { id } = req.params
    const result = await PatientsModel.deletePatient(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// ================= IMAGENES + PACIENTES =================

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
      const insertedResult = await PatientsModel.saveImages(id, processedFiles);

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

    const productData = await PatientsModel.getPatientById(id); 
    const existingFiles = productData?.files || [];

    const keepIds = filesJson.map(f => f.id).filter(id => id != null);
    
    const idsToDelete = existingFiles
      .map(f => f.id)
      .filter(id => id != null && !keepIds.includes(id));

    if (idsToDelete.length > 0) {
      await PatientsModel.deleteFilesPatientsById(idsToDelete);
    }

    const finalFiles = filesJson
      .filter(f => f.id != null)
      .sort((a, b) => a.order - b.order)
      .map((f, i) => ({
        id: f.id,
        name: f.name,
        order: i + 1,
      }));

    savedOrders = await PatientsModel.orderFiles(id, finalFiles);

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

/* ================= SEGUROS ================= */

controller.getAllInsurances = async (req, res) => {
  try {
    const result = await PatientsModel.getAllInsurances()
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.getByIdInsurances = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: "Insurance id required" })
    }

    const result = await PatientsModel.getInsuranceById(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.createInsurances = async (req, res) => {
  try {
    const { nombre, contacto, telefono, estatus } = req.body

    if (!nombre || !contacto || !telefono) {
      return res.status(400).json({
        error: "nombre, contacto y telefono son obligatorios"
      })
    }

    const result = await PatientsModel.createInsurance({
      nombre,
      contacto,
      telefono,
      estatus
    })

    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.updateInsurances = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    if (!id) {
      return res.status(400).json({ error: "Insurance id required" })
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data to update" })
    }

    const result = await PatientsModel.updateInsurance(id, data)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.deleteInsurances = async (req, res) => {
  try {
    const { id } = req.params
    const result = await PatientsModel.deleteInsurance(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

/* ================= HISTORIAS ================= */

controller.getAllStories = async (req, res) => {
  try {
    const result = await PatientsModel.getAllStories()
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.getByIdStories = async (req, res) => {
  try {
    const { id } = req.params
    const result = await PatientsModel.getStoryById(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.getPatientByIdStories = async (req, res) => {
  try {
    const { id } = req.params
    const result = await PatientsModel.getStoriesByPatientId(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.createStories = async (req, res) => {
  try {
    const {
      id_paciente,
      id_medico,
      detalle,
      files,
      estatus
    } = req.body

    if (!id_paciente || !id_medico || !detalle) {
      return res.status(400).json({
        error: "id_paciente, id_medico, fecha y detalle son obligatorios"
      })
    }

    const result = await PatientsModel.createStory({
      id_paciente,
      id_medico,
      detalle,
      files,
      estatus
    })

    console.log(result)

    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.updateStories = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    if (!id) {
      return res.status(400).json({ error: "Story id required" })
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data to update" })
    }

    const result = await PatientsModel.updateStory(id, data)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.deleteStories = async (req, res) => {
  try {
    const { id } = req.params
    const result = await PatientsModel.deleteStory(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.saveFilesHistory = async (req, res) => {
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
      const insertedResult = await PatientsModel.saveImagesHistory(id, processedFiles);

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

    const productData = await PatientsModel.getStoryById(id); 
    const existingFiles = productData?.files || [];

    const keepIds = filesJson.map(f => f.id).filter(id => id != null);
    
    const idsToDelete = existingFiles
      .map(f => f.id)
      .filter(id => id != null && !keepIds.includes(id));

    if (idsToDelete.length > 0) {
      await PatientsModel.deleteFilesHistory(idsToDelete);
    }

    const finalFiles = filesJson
      .filter(f => f.id != null)
      .sort((a, b) => a.order - b.order)
      .map((f, i) => ({
        id: f.id,
        name: f.name,
        order: i + 1,
      }));

    savedOrders = await PatientsModel.orderFiles(id, finalFiles);

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
