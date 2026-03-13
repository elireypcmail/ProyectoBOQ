import pool from "../connection/db.connect.js";

export class BudgetsModel {

  /* ================= OBTENER TODAS ================= */
  static async getAllClinics() {
    let connection;
    try {
      connection = await pool.connect();

      const sql = `
        SELECT 
          id,
          nombre,
          rif,
          contacto,
          telefono,
          email,
          direccion,
          notas,
          estatus,
          fecha_creacion
        FROM clinicas
        WHERE estatus = TRUE
        ORDER BY id DESC
      `;

      const result = await connection.query(sql);

      if (!result.rows.length) {
        return { status: false, code: 404, msg: "No se encontraron clínicas" };
      }

      return { status: true, code: 200, data: result.rows };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener clínicas",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= OBTENER POR ID ================= */
  static async getClinicById(id) {
    let connection;
    try {
      connection = await pool.connect();

      const sql = `
        SELECT *
        FROM clinicas
        WHERE id = $1
      `;

      const result = await connection.query(sql, [id]);

      if (!result.rows.length) {
        return { status: false, code: 404, msg: "Clínica no encontrada" };
      }

      return { status: true, code: 200, data: result.rows[0] };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener clínica",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= CREAR ================= */
  static async createClinic(data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      // Validar duplicado por nombre
      const duplicate = await connection.query(
        `SELECT id FROM clinicas WHERE LOWER(nombre) = LOWER($1)`,
        [data.nombre]
      );

      if (duplicate.rows.length) {
        await connection.query("ROLLBACK");
        return { status: false, code: 409, msg: "La clínica ya existe" };
      }

      const result = await connection.query(
        `INSERT INTO clinicas (
          nombre,
          rif,
          contacto,
          telefono,
          email,
          direccion,
          notas
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
        [
          data.nombre,
          data.rif || null,
          data.contacto,
          data.telefono || null,
          data.email || null,
          data.direccion,
          data.notas
        ]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 201,
        msg: "Clínica creada correctamente",
        data: result.rows[0],
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return {
        status: false,
        code: 500,
        msg: "Error al crear clínica",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= ACTUALIZAR ================= */
  static async updateClinic(id, data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const exists = await connection.query(
        `SELECT id FROM clinicas WHERE id=$1`,
        [id]
      );

      if (!exists.rows.length) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "Clínica no encontrada" };
      }

      const allowedFields = [
        "nombre",
        "rif",
        "contacto",
        "telefono",
        "email",
        "direccion",
        "notas",
        "estatus",
      ];

      const updateData = Object.fromEntries(
        Object.entries(data).filter(([k]) => allowedFields.includes(k))
      );

      if (!Object.keys(updateData).length) {
        await connection.query("ROLLBACK");
        return { status: false, code: 400, msg: "No hay datos para actualizar" };
      }

      const keys = Object.keys(updateData);
      const values = Object.values(updateData);

      const result = await connection.query(
        `UPDATE clinicas 
         SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(", ")}
         WHERE id=$${keys.length + 1}
         RETURNING *`,
        [...values, id]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Clínica actualizada correctamente",
        data: result.rows[0],
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar clínica",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= ELIMINAR (SOFT DELETE) ================= */
  static async deleteClinic(id) {
    let connection;

    try {
      connection = await pool.connect();

      const result = await connection.query(
        `UPDATE clinicas 
         SET estatus = FALSE 
         WHERE id = $1
         RETURNING id`,
        [id]
      );

      if (!result.rowCount) {
        return { status: false, code: 404, msg: "Clínica no encontrada" };
      }

      return {
        status: true,
        code: 200,
        msg: "Clínica desactivada correctamente",
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar clínica",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }
}