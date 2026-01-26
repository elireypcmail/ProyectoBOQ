// Model único
import { PatientsModel } from "../models/patients.model.js"

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

controller.createStories = async (req, res) => {
  try {
    const {
      id_paciente,
      id_medico,
      fecha,
      detalle,
      files,
      estatus
    } = req.body

    if (!id_paciente || !id_medico || !fecha || !detalle) {
      return res.status(400).json({
        error: "id_paciente, id_medico, fecha y detalle son obligatorios"
      })
    }

    const result = await PatientsModel.createStory({
      id_paciente,
      id_medico,
      fecha,
      detalle,
      files,
      estatus
    })

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

