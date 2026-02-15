import pool from "../connection/db.connect.js";

export class SuppliersModel {

  // ================= OBTENER TODOS =================
  static async getAllSuppliers() {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT
          id,
          nombre,
          documento,
          telefono,
          email,
          files,
          estatus,
          fecha_creacion
        FROM proveedores
        ORDER BY id DESC
      `);

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "No se encontraron proveedores"
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
        msg: "Error al obtener los proveedores",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= OBTENER POR ID =================
  static async getSupplierById(id) {
    if (!id) {
      return {
        status: false,
        code: 400,
        msg: "El ID del proveedor es obligatorio"
      };
    }

    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT
          id,
          nombre,
          documento,
          telefono,
          email,
          files,
          estatus,
          fecha_creacion
        FROM proveedores
        WHERE id = $1
      `, [id]);

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Proveedor no encontrado"
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
        msg: "Error al obtener el proveedor",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= CREAR =================
  static async createSupplier(data) {
    let connection;
    try {
      connection = await pool.connect();

      // 🔎 Validar duplicado por nombre
      const duplicate = await connection.query(
        `SELECT id FROM proveedores WHERE LOWER(nombre) = LOWER($1)`,
        [data.nombre]
      );

      if (duplicate.rows.length) {
        return {
          status: false,
          code: 409,
          msg: "El proveedor ya existe"
        };
      }

      const insert = await connection.query(
        `
        INSERT INTO proveedores (
          nombre,
          documento,
          telefono,
          email,
          files,
          estatus
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
          data.nombre,
          data.documento || null,
          data.telefono || null,
          data.email || null,
          null,
          data.estatus ?? true
        ]
      );

      return {
        status: true,
        code: 201,
        msg: "Proveedor creado correctamente",
        data: insert.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear el proveedor",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= ACTUALIZAR =================
  static async updateSupplier(id, data) {
    let connection;
    try {
      connection = await pool.connect();

      const fields = Object.keys(data);
      if (!fields.length) {
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar"
        };
      }

      const values = Object.values(data);
      const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

      const result = await connection.query(
        `
        UPDATE proveedores
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *
        `,
        [...values, id]
      );

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Proveedor no encontrado"
        };
      }

      return {
        status: true,
        code: 200,
        msg: "Proveedor actualizado correctamente",
        data: result.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar el proveedor",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= ELIMINAR =================
  static async deleteSupplier(id) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(
        `DELETE FROM proveedores WHERE id = $1 RETURNING id`,
        [id]
      );

      if (!result.rowCount) {
        return {
          status: false,
          code: 404,
          msg: "Proveedor no encontrado"
        };
      }

      return {
        status: true,
        code: 200,
        msg: "Proveedor eliminado correctamente"
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar el proveedor",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }
}
