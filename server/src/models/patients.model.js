// Dependencies
import pool from "../connection/db.connect.js"

export class PatientsModel {

  // Pacientes

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
        `SELECT * FROM pacientes ORDER BY id DESC`

      const result = await connection.query(sql)

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "No se encontraron pacientes"
        }
      }

      return {
        status: true,
        code: 200,
        data: result.rows
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener los pacientes",
        error: error.message
      }
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
        return {
          status: false,
          code: 404,
          msg: "Paciente no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener el paciente",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createPatient(data) {
    let connection
    try {
      connection = await pool.connect()

      // 🔎 Validar duplicado de forma segura (si vienen campos clave)
      if (data.email || data.documento) {
        const conditions = []
        const values = []
        let index = 1

        if (data.email) {
          conditions.push(`email = $${index++}`)
          values.push(data.email)
        }

        if (data.documento) {
          conditions.push(`documento = $${index++}`)
          values.push(data.documento)
        }

        const duplicate = await connection.query(
          `SELECT id FROM pacientes WHERE ${conditions.join(" OR ")}`,
          values
        )

        if (duplicate.rows.length) {
          return {
            status: false,
            code: 409,
            msg: "El paciente ya existe"
          }
        }
      }

      const keys = Object.keys(data)
      const values = Object.values(data)
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")

      const insert = await connection.query(
        `INSERT INTO pacientes (${keys.join(",")})
        VALUES (${placeholders})
        RETURNING *`,
        values
      )

      return {
        status: true,
        code: 201,
        msg: "Paciente creado correctamente",
        data: insert.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear el paciente",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updatePatient(id, data) {
    let connection
    try {
      connection = await pool.connect()

      const fields = Object.keys(data)
      if (!fields.length) {
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar"
        }
      }

      const values = Object.values(data)
      const setClause = fields
        .map((f, i) => `${f} = $${i + 1}`)
        .join(", ")

      const result = await connection.query(
        `UPDATE pacientes
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *`,
        [...values, id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Paciente no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Paciente actualizado correctamente",
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar el paciente",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deletePatient(id) {
    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(
        `DELETE FROM pacientes WHERE id = $1 RETURNING id`,
        [id]
      )

      if (!result.rowCount) {
        return {
          status: false,
          code: 404,
          msg: "Paciente no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Paciente eliminado correctamente"
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar el paciente",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  // Seguros

  static async getAllInsurances() {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(
        `SELECT * FROM seguros ORDER BY id DESC`
      )

      if (result.rows.length === 0) {
        return {
          status: false,
          code: 404,
          msg: "No se encontraron seguros"
        }
      }

      return {
        status: true,
        code: 200,
        data: result.rows
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener los seguros",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getInsuranceById(id) {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(
        `SELECT * FROM seguros WHERE id = $1`,
        [id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Seguro no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener el seguro",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createInsurance(data) {
    let connection
    try {
      connection = await pool.connect()

      // 🔎 Validar duplicado (por nombre)
      const duplicate = await connection.query(
        `SELECT id FROM seguros WHERE LOWER(nombre) = LOWER($1)`,
        [data.nombre]
      )

      if (duplicate.rows.length) {
        return {
          status: false,
          code: 409,
          msg: "El seguro ya existe"
        }
      }

      const insert = await connection.query(
        `INSERT INTO seguros (nombre, contacto, telefono, estatus)
        VALUES ($1,$2,$3,$4)
        RETURNING *`,
        [
          data.nombre,
          data.contacto,
          data.telefono,
          data.estatus ?? true
        ]
      )

      return {
        status: true,
        code: 201,
        msg: "Seguro creado correctamente",
        data: insert.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear el seguro",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updateInsurance(id, data) {
    let connection
    try {
      connection = await pool.connect()

      const fields = Object.keys(data)
      if (!fields.length) {
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar"
        }
      }

      const values = Object.values(data)
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(", ")

      const result = await connection.query(
        `UPDATE seguros
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *`,
        [...values, id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Seguro no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Seguro actualizado correctamente",
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar el seguro",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteInsurance(id) {
    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(
        `DELETE FROM seguros WHERE id = $1 RETURNING id`,
        [id]
      )

      if (!result.rowCount) {
        return {
          status: false,
          code: 404,
          msg: "Seguro no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Seguro eliminado correctamente"
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar el seguro",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  // Historias

  static async getAllStories() {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(
        `SELECT * FROM historias ORDER BY id DESC`
      )

      if (result.rows.length === 0) {
        return {
          status: false,
          code: 404,
          msg: "No se encontraron historias"
        }
      }

      return {
        status: true,
        code: 200,
        data: result.rows
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener las historias",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getStoryById(id) {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(
        `SELECT * FROM historias WHERE id = $1`,
        [id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Historia no encontrada"
        }
      }

      return {
        status: true,
        code: 200,
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener la historia",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getStoriesByPatientId(id) {
    let connection
    try {
      connection = await pool.connect()
      const result = await connection.query(
        `SELECT * FROM historias WHERE id_paciente = $1`,
        [id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Historia no encontrada"
        }
      }

      return {
        status: true,
        code: 200,
        data: result.rows
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener la historia",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createStory(data) {
    let connection
    try {
      connection = await pool.connect()

      // 🔎 Validar duplicado
      const duplicate = await connection.query(
        `SELECT id FROM historias
        WHERE id_paciente = $1
          AND id_medico = $2
          AND detalle = $3`,
        [
          data.id_paciente,
          data.id_medico,
          data.detalle
        ]
      )

      if (duplicate.rows.length) {
        return {
          status: false,
          code: 409,
          msg: "La historia ya existe"
        }
      }

      const insert = await connection.query(
        `INSERT INTO historias 
          (id_paciente, id_medico, detalle, files, estatus)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *`,
        [
          data.id_paciente,
          data.id_medico,
          data.detalle,
          data.files || [],
          data.estatus ?? true
        ]
      )

      return {
        status: true,
        code: 201,
        msg: "Historia creada correctamente",
        data: insert.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear la historia",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updateStory(id, data) {
    let connection
    try {
      connection = await pool.connect()

      const fields = Object.keys(data)
      if (!fields.length) {
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar"
        }
      }

      const values = Object.values(data)
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(", ")

      const result = await connection.query(
        `UPDATE historias
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *`,
        [...values, id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Historia no encontrada"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Historia actualizada correctamente",
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar la historia",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteStory(id) {
    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(
        `DELETE FROM historias WHERE id = $1 RETURNING id`,
        [id]
      )

      if (!result.rowCount) {
        return {
          status: false,
          code: 404,
          msg: "Historia no encontrada"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Historia eliminada correctamente"
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar la historia",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }
}
