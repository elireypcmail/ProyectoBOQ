// Models
import { Services } from "../models/service.model.js"

export const controller = {}

controller.services = async (req, res) => {
  try {
    const service = await Services.services()
    return res.status(service.code).json(service)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.service = async (req, res) => {
  try {
    const { id } = req.params

    const filterKeys = Object.keys(req.params)

    if (filterKeys.length < 1 || !id) {
      return res.status(404).json({
        error: "Id project required",
      })
    } else {
      const service = await Services.service(id)
      console.log(service)
      return res.status(service.code).json(service)
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.create_service = async (req, res) => {
  try {
    const data = req.body

    console.log(data)

    const filterKeys = Object.keys(req.body)

    if (filterKeys.length < 9) {
      return res.status(404).json({
        error: "Missing fields, please check",
      })
    } else {
      const service = await Services.createService(data)
      console.log(service)
      if (service.code == 201) {
        res.status(service.code).json(service)
      } else {
        return res.status(500).json(service)
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.edit_service = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    const filterKeys = Object.keys(req.body)

    if (filterKeys.length < 9) {
      return res.status(404).json({
        error: "Missing fields, please check",
      })
    } else {
      const service = await Services.editService(id, data)
      if (service.code == 200) {
        res.status(service.code).json(service)
        console.log(service)
      } else {
        return res.status(500).json(service)
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.highlight_service = async (req, res) => {
  try {
    const { id } = req.params

    const filterKeys = Object.keys(req.params)

    if (filterKeys.length < 1 || !id) {
      return res.status(404).json({
        error: "Id project required",
      })
    } else {
      const service = await Services.toggleFeatured(id)
      if (service.code == 200) {
        res.status(service.code).json(service)
      } else {
        return res.status(500).json(service)
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.delete_service = async (req, res) => {
  try {
    const { id } = req.params

    const service = await Services.deleteService(id)
    return res.status(service.code).json(service)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// Files
controller.save_newFiles = async (req, res) => {
  try {
    const { id_service } = req.params
    const files = req.files || []
    const filesJson = JSON.parse(req.body.files_json || "[]")

    // console.log("📂 Archivos subidos:", files)
    // console.log("📑 JSON con orden (referencia cliente):", filesJson)

    let savedFiles = []
    let savedOrders = null

    // 1️⃣ Guardar archivos nuevos en service_images
    if (files.length > 0) {
      const insertedResult = await Services.saveImages(id_service, files)

      if (!insertedResult.status) {
        return res.status(500).json(insertedResult)
      }

      const inserted = insertedResult.data
      savedFiles = insertedResult

      // Reemplazar id:null en el JSON con los IDs recién insertados
      let idx = 0
      for (let i = 0; i < filesJson.length; i++) {
        if (filesJson[i].id == null && inserted[idx]) {
          filesJson[i].id = inserted[idx].id
          filesJson[i].name = inserted[idx].name_file
          idx++
        }
      }

      // 🔧 Asegurar que todos los insertados estén presentes en filesJson
      for (let i = idx; i < inserted.length; i++) {
        const exists = filesJson.some(f => f.name === inserted[i].name_file)
        if (!exists) {
          filesJson.push({
            id: inserted[i].id,
            name: inserted[i].name_file,
            order: filesJson.length + 1,
          })
        }
      }
    }

    // 2️⃣ Obtener archivos existentes del servicio
    const existingService = await Services.services()
    const serviceData =
      existingService?.services?.find((s) => s.id == id_service) || {}
    const existingFiles = serviceData.files || []

    // 3️⃣ Identificar IDs a eliminar (los que estaban y ya no vienen)
    const keepIds = (filesJson || []).map((f) => f.id).filter((id) => id != null)
    const existingIds = (existingFiles || [])
      .map((f) => f.id)
      .filter((id) => id != null)

    const idsToDelete = existingIds.filter((id) => !keepIds.includes(id))

    if (idsToDelete.length > 0) {
      await Services.deleteImagesByIds(idsToDelete)
      console.log("🗑️ Archivos eliminados:", idsToDelete)
    }

    // 4️⃣ Generar JSON final con TODOS los archivos (existentes + nuevos)
    const finalFiles = filesJson
      .filter((f) => f.id != null)
      .sort((a, b) => a.order - b.order)
      .map((f, i) => ({
        id: f.id,
        name: f.name,
        order: i + 1,
      }))

    // console.log("✅ Final JSON (todos los archivos):", finalFiles)

    // 5️⃣ Guardar orden en la base de datos
    savedOrders = await Services.orderFiles(id_service, finalFiles)

    return res.status(201).json({
      code: 201,
      message:
        files.length > 0
          ? "Archivos nuevos, eliminados y orden guardados correctamente"
          : "Orden actualizado y archivos eliminados correctamente",
      savedFiles,
      savedOrders,
    })
  } catch (error) {
    console.error("❌ Error en save_newFiles:", error)
    return res.status(500).json({ error: error.message })
  }
}
