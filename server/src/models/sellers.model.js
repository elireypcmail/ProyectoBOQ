import pool from "../connection/db.connect.js";

export class SellersModel {

  // ================= OBTENER TODOS (solo activos) =================
  static async getAllSellers() {
    let connection;
    try {
      connection = await pool.connect();

      const sql = `
        SELECT 
          v.id,
          v.nombre,
          v.telefono,
          v.email,
          v.id_oficina,
          o.nombre AS oficina,
          v.id_zona,
          z.nombre AS zona,
          v.comision,
          v.estatus,
          v.fecha_creacion
        FROM vendedores v
        LEFT JOIN oficinas o ON o.id = v.id_oficina
        LEFT JOIN zonas z ON z.id = v.id_zona
        WHERE v.estatus = TRUE
        ORDER BY v.id DESC
      `;

      const result = await connection.query(sql);

      return {
        status: true,
        code: 200,
        data: result.rows
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener los vendedores",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= OBTENER POR ID (solo si está activo) =================
  static async getSellerById(id) {
    if (!id) {
      return {
        status: false,
        code: 400,
        msg: "El ID del vendedor es obligatorio"
      };
    }

    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT
          v.id,
          v.nombre,
          v.telefono,
          v.email,
          v.id_oficina,
          o.nombre AS oficina,
          v.id_zona,
          z.nombre AS zona,
          v.comision,
          v.estatus,
          v.fecha_creacion
        FROM vendedores v
        LEFT JOIN oficinas o ON o.id = v.id_oficina
        LEFT JOIN zonas z ON z.id = v.id_zona
        WHERE v.id = $1 AND v.estatus = TRUE
      `, [id]);

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Vendedor no encontrado o inactivo"
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
        msg: "Error al obtener el vendedor",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= CREAR =================
  static async createSeller(data) {
    let connection;
    try {
      connection = await pool.connect();

      if (!data.nombre || !data.id_oficina || !data.id_zona || data.comision == null) {
        return {
          status: false,
          code: 400,
          msg: "Nombre, oficina, zona y comisión son obligatorios"
        };
      }

      const duplicate = await connection.query(
        `SELECT id FROM vendedores WHERE LOWER(nombre) = LOWER($1) AND estatus = TRUE`,
        [data.nombre]
      );

      if (duplicate.rows.length) {
        return {
          status: false,
          code: 409,
          msg: "El vendedor ya existe"
        };
      }

      const insert = await connection.query(
        `
        INSERT INTO vendedores (
          nombre,
          telefono,
          email,
          id_oficina,
          id_zona,
          comision,
          estatus
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,
        [
          data.nombre,
          data.telefono || null,
          data.email || null,
          data.id_oficina,
          data.id_zona,
          data.comision,
          true
        ]
      );

      return {
        status: true,
        code: 201,
        msg: "Vendedor creado correctamente",
        data: insert.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear el vendedor",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= ACTUALIZAR =================
  static async updateSeller(id, data) {
    let connection;
    try {
      connection = await pool.connect();

      const allowedFields = [
        "nombre",
        "telefono",
        "email",
        "id_oficina",
        "id_zona",
        "comision",
        "files",
        "estatus"
      ];

      const fields = Object.keys(data).filter(field =>
        allowedFields.includes(field)
      );

      if (!fields.length) {
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos válidos para actualizar"
        };
      }

      const values = fields.map(field => data[field]);

      const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

      const result = await connection.query(
        `
        UPDATE vendedores
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
          msg: "Vendedor no encontrado"
        };
      }

      return {
        status: true,
        code: 200,
        msg: "Vendedor actualizado correctamente",
        data: result.rows[0]
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar el vendedor",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= ELIMINAR (SOFT DELETE) =================
  static async deleteSeller(id) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(
        `
        UPDATE vendedores
        SET estatus = FALSE
        WHERE id = $1 AND estatus = TRUE
        RETURNING id
        `,
        [id]
      );

      if (!result.rowCount) {
        return {
          status: false,
          code: 404,
          msg: "Vendedor no encontrado o ya eliminado"
        };
      }

      return {
        status: true,
        code: 200,
        msg: "Vendedor desactivado correctamente"
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al desactivar el vendedor",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // ================= IMÁGENES =================
  static async saveImages(id_vendedor, files) {
    let connection;
    try {
      connection = await pool.connect();

      if (!files || !files.length) {
        return { status: true, msg: "No files to save", data: [] };
      }

      const values = [];
      const rows = files.map((f, i) => {
        const offset = i * 5;

        values.push(
          id_vendedor,
          f.originalname,
          f.buffer,
          f.mimetype,
          i === 0
        );

        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      });

      const sqlInsert = `
        INSERT INTO vendedores_images
        (vendedor_id, nombre_file, data, mime_type, is_main)
        VALUES ${rows.join(", ")}
        RETURNING id, nombre_file, is_main
      `;

      const result = await connection.query(sqlInsert, values);

      return {
        status: true,
        msg: `${result.rowCount} images saved successfully`,
        code: 201,
        data: result.rows
      };

    } catch (error) {
      return {
        status: false,
        msg: "Error saving images",
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async orderFiles(id_vendedor, filesJson) {
    let connection;
    try {
      connection = await pool.connect();

      await connection.query(
        `UPDATE vendedores SET files = $1 WHERE id = $2`,
        [JSON.stringify(filesJson), id_vendedor]
      );

      const portada = filesJson.find(f => f.order === 1);

      if (portada?.id) {
        await connection.query(
          `UPDATE vendedores_images SET is_main = false WHERE vendedor_id = $1`,
          [id_vendedor]
        );

        await connection.query(
          `UPDATE vendedores_images SET is_main = true WHERE id = $1`,
          [portada.id]
        );
      }

      return {
        status: true,
        msg: "File order saved successfully",
        code: 201
      };

    } catch (error) {
      return {
        status: false,
        msg: "Error saving file order",
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteFilesById(ids) {
    let connection;
    try {
      connection = await pool.connect();
      await connection.query(
        `DELETE FROM vendedores_images WHERE id = ANY($1::int[])`,
        [ids]
      );
      return { status: true };
    } catch (error) {
      return { status: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

}