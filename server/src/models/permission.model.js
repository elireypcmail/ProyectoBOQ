import pool from "../connection/db.connect.js";

export class Permissions {

  static async create(nombre) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        INSERT INTO permisos (nombre)
        VALUES ($1)
        RETURNING *
      `, [nombre]);

      return { status: true, code: 201, data: result.rows[0] };

    } catch (error) {
      return { status: false, code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

}