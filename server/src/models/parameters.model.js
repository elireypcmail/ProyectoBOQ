// Dependencies
import pool from "../connection/db.connect.js";
import bcrypt from "bcryptjs";

/* ================= PARAMETERS MODEL ================= */
export class Parameters {
  // --- LOGIN PARAMETER ---
  static async createParametroClave(data) {
    let connection;
    try {
      connection = await pool.connect();

      const { contrasena } = data;
      const descripcion = "ClaveParametros";

      await connection.query("BEGIN");

      // 🔍 1. Verificar si ya existe la configuración de la clave
      const verify = await connection.query(
        "SELECT id FROM parametros WHERE descripcion = $1",
        [descripcion]
      );

      if (verify.rows.length > 0) {
        await connection.query("ROLLBACK");
        return { status: false, msg: "La clave de parámetros ya está configurada", code: 409 };
      }

      // 🔐 2. Hash de la contraseña
      // Nota: Se mantiene el .toUpperCase() según tu lógica original
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      // ⚙️ 3. Insertar en la tabla de parametros
      await connection.query(
        `INSERT INTO parametros (descripcion, valor, estatus)
        VALUES ($1, $2, $3)
        RETURNING id, descripcion, fecha_creacion`,
        [descripcion, hashedPassword, true]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        msg: "Contraseña de parámetros configurada correctamente",
        code: 201,
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      console.error("CREATE PARAMETRO ERROR:", error);

      return {
        status: false,
        msg: "Error al configurar la contraseña",
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- LOGIN / VERIFICAR ---
  static async verifyParametroClave(contrasena) {
    let connection;
    try {
      connection = await pool.connect();

      // 🔍 1. Buscar el valor de la clave en la tabla de parámetros
      const query = `
        SELECT valor 
        FROM parametros 
        WHERE descripcion = 'ClaveParametros' AND estatus = TRUE
        LIMIT 1
      `;
      
      const result = await connection.query(query);

      if (result.rows.length === 0) {
        return { status: false, msg: "Clave de acceso no configurada", code: 404 };
      }

      const hashAlmacenado = result.rows[0].valor;

      // 🔐 2. Comparar contraseña (aplicando toUpperCase para coincidir con el Create)
      const isMatch = await bcrypt.compare(contrasena, hashAlmacenado);
      
      if (!isMatch) {
        return { status: false, msg: "Contraseña de parámetros incorrecta", code: 401 };
      }

      // ✅ 3. Éxito
      return {
        status: true,
        msg: "Acceso concedido",
        code: 200
      };

    } catch (error) {
      console.error("VERIFY PARAMETRO ERROR:", error);
      return { 
        status: false, 
        msg: "Error interno al verificar acceso", 
        code: 500, 
        error: error.message 
      };
    } finally {
      if (connection) connection.release();
    }
  }


  // --- GET ALL PARAMETERS ---
  static async getAll() {
    let connection;
    try {
      connection = await pool.connect();
      const query = `SELECT * FROM parametros ORDER BY id ASC`;
      const result = await connection.query(query);

      return {
        status: true,
        data: result.rows,
        code: 200,
      };
    } catch (error) {
      console.error("GET ALL PARAMETERS ERROR:", error);
      return {
        status: false,
        msg: "Error de servidor",
        code: 500,
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- GET PARAMETER BY NAME ---
  static async getByName(nombre) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        "SELECT * FROM parametros WHERE descripcion = $1",
        [nombre],
      );

      if (result.rows.length === 0) {
        return { status: false, msg: "Parámetro no encontrado", code: 404 };
      }

      return { status: true, data: result.rows[0], code: 200 };
    } catch (error) {
      console.error("GET PARAMETER BY NAME ERROR:", error);
      return {
        status: false,
        msg: "Error de servidor",
        code: 500,
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- CREATE PARAMETER ---
  static async create(data) {
    let connection;
    try {
      const { descripcion, valor } = data;
      connection = await pool.connect();
      const result = await connection.query(
        `INSERT INTO parametros (descripcion, valor) VALUES ($1, $2) RETURNING *`,
        [descripcion, valor],
      );

      return {
        status: true,
        msg: "Parámetro creado correctamente",
        data: result.rows[0],
        code: 201,
      };
    } catch (error) {
      console.error("CREATE PARAMETER ERROR:", error);
      return { status: false, msg: "Error al crear parámetro", code: 500 };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- UPDATE PARAMETER ---
  static async update(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      const { descripcion, valor, estatus } = data;

      const result = await connection.query(
        `UPDATE parametros 
         SET descripcion = COALESCE($1, descripcion), 
             valor = COALESCE($2, valor), 
             estatus = COALESCE($3, estatus) 
         WHERE id = $4 RETURNING *`,
        [descripcion, valor, estatus, id],
      );

      if (result.rowCount === 0) {
        return { status: false, msg: "Parámetro no encontrado", code: 404 };
      }

      return {
        status: true,
        msg: "Parámetro actualizado",
        data: result.rows[0],
        code: 200,
      };
    } catch (error) {
      return { status: false, msg: "Error al actualizar", code: 500 };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- DELETE PARAMETER ---
  static async delete(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        "DELETE FROM parametros WHERE id = $1 RETURNING id",
        [id],
      );

      if (result.rowCount === 0) {
        return {
          status: false,
          msg: "No se pudo eliminar, ID no encontrado",
          code: 404,
        };
      }

      return { status: true, msg: "Parámetro eliminado", code: 200 };
    } catch (error) {
      return { status: false, msg: "Error de servidor", code: 500 };
    } finally {
      if (connection) connection.release();
    }
  }
}

/* ================= IMAGES MODEL ================= */
export class Images {
  // --- GET ALL IMAGES ---
  static async getAllImgParam() {
    let connection;
    try {
      connection = await pool.connect();

      // We use encode(data, 'base64') to send the image string to the front
      const sql = `
        SELECT 
          id, 
          nombre, 
          nombre_file, 
          mime_type, 
          encode(data, 'base64') AS data, 
          fecha_creacion 
        FROM parametros_images 
        ORDER BY id DESC
      `;

      const result = await connection.query(sql);

      return { 
        status: true, 
        data: result.rows, 
        code: 200 
      };
    } catch (error) {
      console.error("❌ GET ALL IMG PARAM ERROR:", error);
      return { 
        status: false, 
        msg: "Error al obtener las imágenes de parámetros", 
        error: error.message,
        code: 500 
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- CREATE IMAGE (BYTEA) ---
  static async createImgParam(data) {
    let connection;
    try {
      connection = await pool.connect();

      // Check if data exists
      if (!data || Object.keys(data).length === 0) {
        return { status: false, msg: "No hay datos para guardar", code: 400 };
      }

      const { nombre, nombre_file, data: binaryData, mime_type } = data;

      // Parameters for the query
      const values = [nombre, nombre_file, binaryData, mime_type];

      // We use placeholders ($1, $2, etc.) to keep it consistent with the multi-row logic
      const sqlInsert = `
        INSERT INTO parametros_images 
        (nombre, nombre_file, data, mime_type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nombre, nombre_file
      `;

      const result = await connection.query(sqlInsert, values);

      return {
        status: true,
        msg: "Imagen guardada correctamente",
        code: 201,
        data: result.rows[0], // Returning the single inserted row
      };
    } catch (error) {
      console.error("❌ Error en Parameters.createImgParam:", error);
      return {
        status: false,
        msg: "Error al guardar la imagen",
        code: 500,
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- UPDATE IMAGE ---
  static async updateImgParam(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      
      // Extraemos con valores por defecto null para el COALESCE de SQL
      const { 
        nombre = null, 
        nombre_file = null, 
        data: binaryData = null, 
        mime_type = null 
      } = data;

      const sqlUpdate = `
        UPDATE parametros_images 
        SET 
          nombre = COALESCE($1, nombre), 
          nombre_file = COALESCE($2, nombre_file), 
          data = COALESCE($3, data), 
          mime_type = COALESCE($4, mime_type) 
        WHERE id = $5 
        RETURNING id, nombre, nombre_file, mime_type
      `;

      const values = [nombre, nombre_file, binaryData, mime_type, id];
      const result = await connection.query(sqlUpdate, values);

      if (result.rowCount === 0) {
        return { status: false, msg: "Imagen no encontrada", code: 404 };
      }

      return {
        status: true,
        msg: "Imagen actualizada y optimizada correctamente",
        data: result.rows[0],
        code: 200,
      };
    } catch (error) {
      console.error("❌ Error en Images.updateImgParam:", error);
      return { 
        status: false, 
        msg: "Error en la base de datos al actualizar", 
        code: 500,
        error: error.message 
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- DELETE IMAGE ---
  static async deleteImgParam(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        "DELETE FROM parametros_images WHERE id = $1 RETURNING id",
        [id],
      );
      if (result.rowCount === 0)
        return { status: false, msg: "Imagen no encontrada", code: 404 };
      return { status: true, msg: "Imagen eliminada", code: 200 };
    } catch (error) {
      return { status: false, msg: "Error al eliminar imagen", code: 500 };
    } finally {
      if (connection) connection.release();
    }
  }
}
