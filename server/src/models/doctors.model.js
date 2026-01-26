import pool from "../connection/db.connect.js"

export class DoctorsModel {
   /* =====================================================
     ===================== MEDICOS =======================
  ===================================================== */

  static async getAllsDoctors() {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(`
        SELECT 
          m.id,
          m.nombre,
          m.telefono,
          m.estatus,
          m.id_tipoMedico,
          tm.nombre AS tipo
        FROM medicos m
        INNER JOIN tipomedicos tm ON tm.id = m.id_tipoMedico
        ORDER BY m.id DESC
      `)

        console.log(result.rows)

      return result.rows.length
        ? { status: true, code: 200, data: result.rows }
        : { status: false, code: 404, msg: "Doctors not found" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching doctors", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getDoctorById(id) {
    if (!id) return { status: false, code: 400, msg: "Doctor ID required" }
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(`
        SELECT 
          m.id,
          m.nombre,
          m.telefono,
          m.estatus,
          m.id_tipoMedico,
          tm.nombre AS tipo
        FROM medicos m
        LEFT JOIN tipomedicos tm ON tm.id = m.id_tipoMedico
        WHERE m.id = $1
      `, [id])
      return result.rows.length
        ? { status: true, code: 200, data: result.rows[0] }
        : { status: false, code: 404, msg: "Doctor not found" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching doctor", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createDoctor(data) {
    let connection
    try {
      connection = await pool.connect()
      const insert = await connection.query(
        `INSERT INTO medicos (id_tipoMedico, nombre, telefono, estatus)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [data.id_tipoMedico, data.nombre, data.telefono || null, data.estatus ?? true]
      )
      return { status: true, code: 201, msg: "Doctor created", data: insert.rows[0] }
    } catch (error) {
      return { status: false, code: 500, msg: "Error creating doctor", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updateDoctor(id, data) {
    let connection
    try {
      connection = await pool.connect()
      const fields = Object.keys(data)
      const values = Object.values(data)
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(", ")
      const result = await connection.query(
        `UPDATE medicos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      )
      return { status: true, code: 200, msg: "Doctor updated", data: result.rows[0] }
    } catch (error) {
      return { status: false, code: 500, msg: "Error updating doctor", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteDoctor(id) {
    let connection
    try {
      connection = await pool.connect()
      await connection.query(`DELETE FROM medicos WHERE id = $1`, [id])
      return { status: true, code: 200, msg: "Doctor deleted" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error deleting doctor", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  /* =====================================================
     ================= TIPOS DE MEDICOS ==================
  ===================================================== */

  static async getAllDoctorsTypes() {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(`SELECT * FROM tipomedicos`)
      return result.rows.length
        ? { status: true, code: 200, data: result.rows }  // ✅ todos los registros
        : { status: false, code: 404, msg: "Doctor types not found" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching doctor types", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getDoctorTypeById(id) {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(`SELECT * FROM tipomedicos`)
      return result.rows.length
        ? { status: true, code: 200, data: result.rows[0] }
        : { status: false, code: 404, msg: "Doctor type not found" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching doctor type", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createDoctorType(data) {
    let connection
    try {
      connection = await pool.connect()
      const insert = await connection.query(
        `INSERT INTO tipomedicos (nombre, estatus)
         VALUES ($1,$2)
         RETURNING *`,
        [data.nombre, data.estatus ?? true]
      )
      return { status: true, code: 201, msg: "Doctor type created", data: insert.rows[0] }
    } catch (error) {
      return { status: false, code: 500, msg: "Error creating doctor type", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updateDoctorType(id, data) {
    let connection
    try {
      connection = await pool.connect()
      const fields = Object.keys(data)
      const values = Object.values(data)
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(", ")
      const result = await connection.query(
        `UPDATE tipomedicos SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      )
      return { status: true, code: 200, msg: "Doctor type updated", data: result.rows[0] }
    } catch (error) {
      return { status: false, code: 500, msg: "Error updating doctor type", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteDoctorType(id) {
    let connection
    try {
      connection = await pool.connect()
      await connection.query(`DELETE FROM tipomedicos WHERE id = $1`, [id])
      return { status: true, code: 200, msg: "Doctor type deleted" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error deleting doctor type", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }
}