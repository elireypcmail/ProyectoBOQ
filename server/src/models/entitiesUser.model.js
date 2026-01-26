// models/EntitiesUser.model.js
import pool from "../connection/db.connect.js";

export class EntitiesUser {

  static async getAll(table) {
    const msgEmpty = {
      status: false,
      msg: `No hay registros en ${table}`,
      code: 404
    };

    let connection;

    try {
      connection = await pool.connect();

      let sql;
      // Si es oficinas, hacemos join con zonas
      if (table === "oficinas") {
        sql = `
          SELECT o.*, z.nombre AS nombre_zona
          FROM oficinas o
          LEFT JOIN zonas z ON o.id_zona = z.id
          WHERE o.estatus = true
          ORDER BY o.id
        `;
      } else {
        sql = `SELECT * FROM ${table} WHERE estatus = true ORDER BY id`;
      }

      const result = await connection.query(sql);

      if (result.rows.length === 0) return msgEmpty;

      return {
        status: true,
        msg: `Registros de ${table} obtenidos correctamente`,
        code: 200,
        data: result.rows
      };

    } catch (error) {
      return {
        status: false,
        msg: `Error al obtener registros de ${table}`,
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async getById(table, id) {
    const msgNotFound = {
      status: false,
      msg: `Registro con id ${id} no encontrado en ${table}`,
      code: 404
    };

    let connection;

    try {
      connection = await pool.connect();

      let sql;
      let values = [id];

      if (table === "oficinas") {
        sql = `
          SELECT o.*, z.nombre AS nombre_zona
          FROM oficinas o
          LEFT JOIN zonas z ON o.id_zona = z.id
          WHERE o.id = $1 AND o.estatus = true
        `;
      } else {
        sql = `SELECT * FROM ${table} WHERE id = $1 AND estatus = true`;
      }

      const result = await connection.query(sql, values);

      if (result.rows.length === 0) return msgNotFound;

      return {
        status: true,
        msg: `Registro de ${table} obtenido correctamente`,
        code: 200,
        data: result.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        msg: `Error al obtener el registro de ${table}`,
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async create(table, data) {
    const msgError = {
      status: false,
      msg: `No se pudo crear el registro en ${table}`,
      code: 500
    };

    let connection;

    try {
      connection = await pool.connect();

      const keys = Object.keys(data);
      const values = Object.values(data);

      if (keys.length === 0) {
        return {
          status: false,
          msg: "No se enviaron datos para crear el registro",
          code: 400
        };
      }

      const columns = keys.join(", ");
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
      const result = await connection.query(sql, values);

      if (result.rows.length === 0) return msgError;

      return {
        status: true,
        msg: `Registro creado correctamente en ${table}`,
        code: 201,
        data: result.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        msg: `Error al crear registro en ${table}`,
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ============================= */
  /* UPDATE */
  /* ============================= */
  static async update(table, id, data) {
    const msgNotFound = {
      status: false,
      msg: `Registro con id ${id} no encontrado en ${table}`,
      code: 404
    };

    const msgError = {
      status: false,
      msg: `No se pudo actualizar el registro en ${table}`,
      code: 500
    };

    let connection;

    try {
      connection = await pool.connect();

      const keys = Object.keys(data);
      const values = Object.values(data);

      if (keys.length === 0) {
        return {
          status: false,
          msg: "No se enviaron datos para actualizar",
          code: 400
        };
      }

      const setQuery = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
      const sql = `UPDATE ${table} SET ${setQuery} WHERE id = $${keys.length + 1} RETURNING *`;
      const result = await connection.query(sql, [...values, id]);

      if (result.rows.length === 0) return msgNotFound;

      return {
        status: true,
        msg: `Registro de ${table} actualizado correctamente`,
        code: 200,
        data: result.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        msg: `Error al actualizar registro en ${table}`,
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ============================= */
  /* DELETE (SOFT DELETE) */
  /* ============================= */
  static async delete(table, id) {
    const msgNotFound = {
      status: false,
      msg: `Registro con id ${id} no encontrado en ${table}`,
      code: 404
    };

    const msgError = {
      status: false,
      msg: `No se pudo eliminar el registro en ${table}`,
      code: 500
    };

    let connection;

    try {
      connection = await pool.connect();

      const sql = `UPDATE ${table} SET estatus = false WHERE id = $1 RETURNING *`;
      const result = await connection.query(sql, [id]);

      if (result.rows.length === 0) return msgNotFound;

      return {
        status: true,
        msg: `Registro eliminado correctamente en ${table}`,
        code: 200,
        data: result.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        msg: `Error al eliminar registro en ${table}`,
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }
}
