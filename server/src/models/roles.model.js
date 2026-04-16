import pool from "../connection/db.connect.js";

export class Roles {

  // --- CREAR ROL ---
  static async create(data) {
    let connection;
    try {
      connection = await pool.connect();
      const { nombre, descripcion = null } = data;

      // 🔍 Validar si el rol ya existe
      const verify = await connection.query("SELECT id FROM roles WHERE nombre = $1", [nombre]);
      if (verify.rows.length > 0) {
        return { status: false, msg: "Este rol ya existe", code: 409 };
      }

      const result = await connection.query(`
        INSERT INTO roles (nombre, descripcion)
        VALUES ($1, $2)
        RETURNING *
      `, [nombre, descripcion]);

      return { status: true, msg: "Rol creado exitosamente", code: 201, data: result.rows[0] };

    } catch (error) {
      console.error("CREATE ROLE ERROR:", error);
      return { status: false, msg: "Error de servidor", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- OBTENER TODOS LOS ROLES ---
  static async getAll() {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query("SELECT * FROM roles ORDER BY id ASC");

      if (result.rows.length === 0) {
        return { status: false, msg: "No hay roles registrados", code: 404 };
      }

      return { status: true, data: result.rows, code: 200 };

    } catch (error) {
      return { status: false, msg: "Error al obtener roles", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- ACTUALIZAR ROL ---
  static async update(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      const { nombre, descripcion } = data;

      const fields = [];
      const values = [];
      let index = 1;

      if (nombre) {
        fields.push(`nombre = $${index++}`);
        values.push(nombre);
      }
      if (descripcion !== undefined) {
        fields.push(`descripcion = $${index++}`);
        values.push(descripcion);
      }

      if (fields.length === 0) {
        return { status: false, msg: "No hay datos para actualizar", code: 400 };
      }

      values.push(id);
      const query = `
        UPDATE roles 
        SET ${fields.join(", ")} 
        WHERE id = $${index} 
        RETURNING *
      `;

      const result = await connection.query(query, values);

      if (result.rowCount === 0) {
        return { status: false, msg: "Rol no encontrado", code: 404 };
      }

      return { status: true, msg: "Rol actualizado", code: 200, data: result.rows[0] };

    } catch (error) {
      return { status: false, msg: "Error al actualizar rol", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- ELIMINAR ROL ---
  static async delete(id) {
    let connection;
    try {
      connection = await pool.connect();
      
      // ⚠️ Opcional: Validar si hay usuarios usando este rol antes de borrar
      const checkUsers = await connection.query("SELECT id FROM usuarios WHERE rol = (SELECT nombre FROM roles WHERE id = $1) LIMIT 1", [id]);
      
      if (checkUsers.rows.length > 0) {
        return { status: false, msg: "No se puede eliminar un rol que está asignado a usuarios", code: 400 };
      }

      const result = await connection.query("DELETE FROM roles WHERE id = $1 RETURNING id", [id]);

      if (result.rowCount === 0) {
        return { status: false, msg: "Rol no encontrado", code: 404 };
      }

      return { status: true, msg: "Rol eliminado correctamente", code: 200 };

    } catch (error) {
      return { status: false, msg: "Error al eliminar rol", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }
}