// Model único
import { DoctorsModel } from "../models/doctors.model.js"

export const controller = {}

/* ================= PACIENTES =======

/* ================= MEDICOS ================= */

controller.getAllDoctors = async (req, res) => {
  try {
    console.log(12)
    const result = await DoctorsModel.getAllsDoctors()
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.getByIdDoctors = async (req, res) => {
  try {
    const { id } = req.params
    const result = await DoctorsModel.getDoctorById(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.createDoctors = async (req, res) => {
  try {
    const { id_tipoMedico, nombre, telefono, estatus } = req.body

    if (!id_tipoMedico || !nombre) {
      return res.status(400).json({
        error: "id_tipoMedico y nombre son obligatorios"
      })
    }

    const result = await DoctorsModel.createDoctor({
      id_tipoMedico,
      nombre,
      telefono,
      estatus
    })

    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.updateDoctors = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    if (!id) {
      return res.status(400).json({ error: "Doctor id required" })
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data to update" })
    }

    const result = await DoctorsModel.updateDoctor(id, data)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.deleteDoctors = async (req, res) => {
  try {
    const { id } = req.params
    const result = await DoctorsModel.deleteDoctor(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

/* ================= TIPOS DE MEDICOS ================= */

controller.getAllDoctorTypes = async (req, res) => {
  try {
    const result = await DoctorsModel.getAllDoctorsTypes()
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.getByIdDoctorTypes = async (req, res) => {
  try {
    const { id } = req.params
    console.log(134)
    const result = await DoctorsModel.getDoctorTypeById(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.createDoctorTypes = async (req, res) => {
  try {
    const { nombre, estatus } = req.body

    if (!nombre) {
      return res.status(400).json({
        error: "nombre es obligatorio"
      })
    }

    const result = await DoctorsModel.createDoctorType({
      nombre,
      estatus
    })

    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.updateDoctorTypes = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    if (!id) {
      return res.status(400).json({ error: "Doctor type id required" })
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No data to update" })
    }

    const result = await DoctorsModel.updateDoctorType(id, data)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

controller.deleteDoctorTypes = async (req, res) => {
  try {
    const { id } = req.params
    const result = await DoctorsModel.deleteDoctorType(id)
    return res.status(result.code).json(result)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
