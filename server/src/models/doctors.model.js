import pool from "../connection/db.connect.js"

export class DoctorsModel {

  // Personal Médico

  static async getAllsDoctors() {
    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(`
        SELECT 
          m.id,
          m.nombre,
          m.telefono,
          m.email,
          m.notificaciones,
          m.estatus,
          m.id_tipoMedico,
          tm.nombre AS tipo
        FROM medicos m
        INNER JOIN tipomedicos tm ON tm.id = m.id_tipoMedico
        WHERE m.estatus = TRUE
        ORDER BY m.id DESC
      `)

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "No se encontraron médicos"
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
        msg: "Error al obtener los médicos",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getDoctorById(id) {
    if (!id) {
      return {
        status: false,
        code: 400,
        msg: "El ID del médico es obligatorio"
      }
    }

    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(`
        SELECT 
          m.id,
          m.nombre,
          m.telefono,
          m.email,
          m.notificaciones,
          m.estatus,
          m.id_tipoMedico,
          tm.nombre AS tipo
        FROM medicos m
        LEFT JOIN tipomedicos tm ON tm.id = m.id_tipoMedico
        WHERE m.id = $1
      `, [id])

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Médico no encontrado"
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
        msg: "Error al obtener el médico",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createDoctor(data) {
    let connection
    try {
      connection = await pool.connect()

      // 🔎 Validar duplicado (nombre + tipo de médico)
      const duplicate = await connection.query(
        `SELECT id FROM medicos
        WHERE LOWER(nombre) = LOWER($1)
        AND id_tipoMedico = $2`,
        [data.nombre, data.id_tipoMedico]
      )

      if (duplicate.rows.length) {
        return {
          status: false,
          code: 409,
          msg: "El médico ya existe"
        }
      }

      const insert = await connection.query(
        `INSERT INTO medicos 
        (id_tipoMedico, nombre, telefono, email, notificaciones, estatus)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
          data.id_tipoMedico,
          data.nombre,
          data.telefono || null,
          data.email || null,
          data.notificaciones ?? false,
          data.estatus ?? true
        ]
      )

      return {
        status: true,
        code: 201,
        msg: "Médico creado correctamente",
        data: insert.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear el médico",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updateDoctor(id, data) {
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
        `UPDATE medicos
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *`,
        [...values, id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Médico no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Médico actualizado correctamente",
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar el médico",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteDoctor(id) {
    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(
        `DELETE FROM medicos WHERE id = $1 RETURNING id`,
        [id]
      )

      if (!result.rowCount) {
        return {
          status: false,
          code: 404,
          msg: "Médico no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Médico eliminado correctamente"
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar el médico",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }


  // Tipo de Personal Médico

  static async getAllDoctorsTypes() {
    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(
        `SELECT * FROM tipomedicos ORDER BY id DESC`
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "No se encontraron tipos de médicos"
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
        msg: "Error al obtener los tipos de médicos",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async getDoctorTypeById(id) {
    if (!id) {
      return {
        status: false,
        code: 400,
        msg: "El ID del tipo de médico es obligatorio"
      }
    }

    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(
        `SELECT * FROM tipomedicos WHERE id = $1`,
        [id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Tipo de médico no encontrado"
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
        msg: "Error al obtener el tipo de médico",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async createDoctorType(data) {
    let connection
    try {
      connection = await pool.connect()

      // 🔎 Validar duplicado por nombre
      const duplicate = await connection.query(
        `SELECT id FROM tipomedicos WHERE LOWER(nombre) = LOWER($1)`,
        [data.nombre]
      )

      if (duplicate.rows.length) {
        return {
          status: false,
          code: 409,
          msg: "El tipo de médico ya existe"
        }
      }

      const insert = await connection.query(
        `INSERT INTO tipomedicos (nombre, estatus)
        VALUES ($1,$2)
        RETURNING *`,
        [
          data.nombre,
          data.estatus ?? true
        ]
      )

      return {
        status: true,
        code: 201,
        msg: "Tipo de médico creado correctamente",
        data: insert.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear el tipo de médico",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async updateDoctorType(id, data) {
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
        `UPDATE tipomedicos
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *`,
        [...values, id]
      )

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Tipo de médico no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Tipo de médico actualizado correctamente",
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar el tipo de médico",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteDoctorType(id) {
    let connection
    try {
      connection = await pool.connect()

      const result = await connection.query(
        `DELETE FROM tipomedicos WHERE id = $1 RETURNING id`,
        [id]
      )

      if (!result.rowCount) {
        return {
          status: false,
          code: 404,
          msg: "Tipo de médico no encontrado"
        }
      }

      return {
        status: true,
        code: 200,
        msg: "Tipo de médico eliminado correctamente"
      }

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar el tipo de médico",
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

    // Personal

  static async getAllStaff() {
    let connection;
    try {
      connection = await pool.connect();

      // Joining with 'medicos' to get meaningful data (like names)
      const result = await connection.query(
        `SELECT p.*, m.nombre as nombre_medico 
        FROM personal p
        LEFT JOIN medicos m ON p.id_medico = m.id
        ORDER BY p.id DESC`
      );

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "No staff members found"
        };
      }

      return {
        status: true,
        code: 200,
        data: result.rows
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error retrieving staff members",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async getStaffById(id) {
    if (!id) {
      return {
        status: false,
        code: 400,
        msg: "Staff ID is required"
      };
    }

    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(
        `SELECT p.*, m.nombre as nombre_medico 
        FROM personal p
        LEFT JOIN medicos m ON p.id_medico = m.id 
        WHERE p.id = $1`,
        [id]
      );

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Staff member not found"
        };
      }

      return {
        status: true,
        code: 200,
        data: result.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error retrieving staff member",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createStaff(data) {
    let connection;
    try {
      connection = await pool.connect();

      // Validate if the doctor is already assigned to the staff list
      const duplicate = await connection.query(
        `SELECT id FROM personal WHERE id_medico = $1`,
        [data.id_medico]
      );

      if (duplicate.rows.length) {
        return {
          status: false,
          code: 409,
          msg: "This doctor is already registered as staff"
        };
      }

      const insert = await connection.query(
        `INSERT INTO personal (id_medico, estatus)
        VALUES ($1, $2)
        RETURNING *`,
        [
          data.id_medico,
          data.estatus ?? true
        ]
      );

      return {
        status: true,
        code: 201,
        msg: "Staff member created successfully",
        data: insert.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error creating staff member",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateStaff(id, data) {
    let connection;
    try {
      connection = await pool.connect();

      const fields = Object.keys(data);
      if (!fields.length) {
        return {
          status: false,
          code: 400,
          msg: "No data provided for update"
        };
      }

      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(", ");

      const result = await connection.query(
        `UPDATE personal
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *`,
        [...values, id]
      );

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Staff member not found"
        };
      }

      return {
        status: true,
        code: 200,
        msg: "Staff member updated successfully",
        data: result.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error updating staff member",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteStaff(id) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(
        `DELETE FROM personal WHERE id = $1 RETURNING id`,
        [id]
      );

      if (!result.rowCount) {
        return {
          status: false,
          code: 404,
          msg: "Staff member not found"
        };
      }

      return {
        status: true,
        code: 200,
        msg: "Staff member deleted successfully"
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error deleting staff member",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }
}