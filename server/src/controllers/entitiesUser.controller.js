import { EntitiesUser } from "../models/entitiesUser.model.js"

export const controllerEnt = {}

/* ================= GET ALL ================= */
controllerEnt.getAll = async (req, res) => {
  try {
    const { table } = req.params
    const data = await EntitiesUser.getAll(table)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* ================= GET BY ID ================= */
controllerEnt.getById = async (req, res) => {
  try {
    const { table, id } = req.params
    const data = await EntitiesUser.getById(table, id)

    if (!data) {
      return res.status(404).json({ error: "Registro no encontrado" })
    }

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* ================= CREATE ================= */
controllerEnt.create = async (req, res) => {
  try {
    const { table } = req.params
    const data = req.body

    // Validación específica por entidad
    if (table === "oficinas" && !data.id_zona) {
      return res.status(400).json({
        error: "El campo id_zona es obligatorio para oficinas"
      })
    }

    const result = await EntitiesUser.create(table, data)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* ================= UPDATE ================= */
controllerEnt.update = async (req, res) => {
  try {
    const { table, id } = req.params
    const data = req.body

    // Validación específica por entidad
    if (table === "oficinas" && !data.id_zona) {
      return res.status(400).json({
        error: "El campo id_zona es obligatorio para oficinas"
      })
    }

    const result = await EntitiesUser.update(table, id, data)

    if (!result) {
      return res.status(404).json({ error: "Registro no encontrado" })
    }

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* ================= DELETE ================= */
controllerEnt.delete = async (req, res) => {
  try {
    const { table, id } = req.params

    const result = await EntitiesUser.delete(table, id)

    if (!result) {
      return res.status(404).json({ error: "Registro no encontrado" })
    }

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
