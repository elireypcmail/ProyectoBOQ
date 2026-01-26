// Dependencies
import pool from "../connection/db.connect.js"

export class PatientsModel {

  /* =====================================================
     ===================== PACIENTES =====================
  ===================================================== */

  static async getAllPatients() {
    let connection
    try {
      connection = await pool.connect()

      const sql = 
      // `SELECT 
      //     p.*,
      //     COALESCE(
      //       json_agg(
      //         json_build_object(
      //           'id', pi.id,
      //           'data', encode(pi.data, 'base64'),
      //           'mime_type', pi.mime_type,
      //           'is_main', pi.is_main,
      //           'nombre_file', pi.nombre_file
      //         )
      //       ) FILTER (WHERE pi.id IS NOT NULL), '[]'
      //     ) AS images
      //   FROM pacientes p
      //   LEFT JOIN paciente_images pi ON pi.paciente_id = p.id
      //   GROUP BY p.id
      //   ORDER BY p.id DESC
      // `
      `SELECT * FROM pacientes`

      const result = await connection.query(sql)
      console.log(result)

      return result.rows.length
        ? { status: true, code: 200, data: result.rows }
        : { status: false, code: 404, msg: "Patients not found" }

    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching patients", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getPatientById(id) {
    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(
        `SELECT * FROM pacientes WHERE id = $1`,
        [id]
      )

      if (!result.rows.length) {
        return { status: false, code: 404, msg: "Patient not found" }
      }

      return { status: true, code: 200, data: result.rows[0] }

    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching patient", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createPatient(data) {
    let connection
    try {
      connection = await pool.connect()

      const keys = Object.keys(data)
      const values = Object.values(data)
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")

      const insert = await connection.query(
        `INSERT INTO pacientes (${keys.join(",")})
         VALUES (${placeholders})
         RETURNING *`,
        values
      )

      return { status: true, code: 201, msg: "Patient created", data: insert.rows[0] }

    } catch (error) {
      return { status: false, code: 500, msg: "Error creating patient", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updatePatient(id, data) {
    let connection
    try {
      connection = await pool.connect()

      const verify = await connection.query(
        `SELECT id FROM pacientes WHERE id = $1`,
        [id]
      )

      if (!verify.rows.length) {
        return { status: false, code: 404, msg: "Patient not found" }
      }

      const fields = Object.keys(data)
      const values = Object.values(data)

      const setClause = fields
        .map((f, i) => `${f} = $${i + 1}`)
        .join(", ")

      const result = await connection.query(
        `UPDATE pacientes SET ${setClause}
         WHERE id = $${fields.length + 1}
         RETURNING *`,
        [...values, id]
      )

      return { status: true, code: 200, msg: "Patient updated", data: result.rows[0] }

    } catch (error) {
      return { status: false, code: 500, msg: "Error updating patient", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deletePatient(id) {
    let connection
    try {
      connection = await pool.connect()
      await connection.query(`DELETE FROM pacientes WHERE id = $1`, [id])
      return { status: true, code: 200, msg: "Patient deleted" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error deleting patient", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  /* =====================================================
     ===================== SEGUROS =======================
  ===================================================== */

  static async getAllInsurances() {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(`SELECT * FROM seguros ORDER BY id DESC`)
      return { status: true, code: 200, data: result.rows }
    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching insurances", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getInsuranceById(id) {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(`SELECT * FROM seguros WHERE id = $1`, [id])
      return result.rows.length
        ? { status: true, code: 200, data: result.rows[0] }
        : { status: false, code: 404, msg: "Insurance not found" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching insurance", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createInsurance(data) {
    let connection
    try {
      connection = await pool.connect()
      const insert = await connection.query(
        `INSERT INTO seguros (nombre, contacto, telefono, estatus)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [data.nombre, data.contacto, data.telefono, data.estatus ?? true]
      )
      return { status: true, code: 201, msg: "Insurance created", data: insert.rows[0] }
    } catch (error) {
      return { status: false, code: 500, msg: "Error creating insurance", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updateInsurance(id, data) {
    let connection
    try {
      connection = await pool.connect()

      const fields = Object.keys(data)
      const values = Object.values(data)
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(", ")

      const result = await connection.query(
        `UPDATE seguros SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      )

      return { status: true, code: 200, msg: "Insurance updated", data: result.rows[0] }

    } catch (error) {
      return { status: false, code: 500, msg: "Error updating insurance", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteInsurance(id) {
    let connection
    try {
      connection = await pool.connect()
      await connection.query(`DELETE FROM seguros WHERE id = $1`, [id])
      return { status: true, code: 200, msg: "Insurance deleted" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error deleting insurance", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  /* =====================================================
     ===================== HISTORIAS =====================
  ===================================================== */

  static async getAllStories() {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(`SELECT * FROM historias ORDER BY id DESC`)
      return { status: true, code: 200, data: result.rows }
    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching stories", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getStoryById(id) {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(`SELECT * FROM historias WHERE id = $1`, [id])
      return result.rows.length
        ? { status: true, code: 200, data: result.rows[0] }
        : { status: false, code: 404, msg: "Story not found" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error fetching story", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createStory(data) {
    let connection
    try {
      connection = await pool.connect()
      const insert = await connection.query(
        `INSERT INTO historias (id_paciente, id_medico, fecha, detalle, files, estatus)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [
          data.id_paciente,
          data.id_medico,
          data.fecha,
          data.detalle,
          data.files || [],
          data.estatus ?? true
        ]
      )
      return { status: true, code: 201, msg: "Story created", data: insert.rows[0] }
    } catch (error) {
      return { status: false, code: 500, msg: "Error creating story", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updateStory(id, data) {
    let connection
    try {
      connection = await pool.connect()

      const fields = Object.keys(data)
      const values = Object.values(data)
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(", ")

      const result = await connection.query(
        `UPDATE historias SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      )

      return { status: true, code: 200, msg: "Story updated", data: result.rows[0] }

    } catch (error) {
      return { status: false, code: 500, msg: "Error updating story", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteStory(id) {
    let connection
    try {
      connection = await pool.connect()
      await connection.query(`DELETE FROM historias WHERE id = $1`, [id])
      return { status: true, code: 200, msg: "Story deleted" }
    } catch (error) {
      return { status: false, code: 500, msg: "Error deleting story", error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }
}
