import pool from "../connection/db.connect.js";

export class SuppliersModel {

  // ================= OBTENER TODOS =================
  static async getAllSuppliers() {
    let connection;
    try {
      connection = await pool.connect();

      const sql = `
        SELECT 
          p.id,
          p.nombre,
          p.documento,
          p.telefono,
          p.email,
          p.datos_bancarios,
          p.files,
          p.estatus,
          p.fecha_creacion,

          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'data', encode(pi.data, 'base64'),
                'mime_type', pi.mime_type,
                'nombre_file', pi.nombre_file,
                'is_main', pi.is_main
              )
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'
          ) AS images

        FROM proveedores p
        LEFT JOIN proveedores_images pi 
          ON pi.proveedor_id = p.id

        WHERE p.estatus = TRUE

        GROUP BY p.id
        ORDER BY p.id DESC
      `;

      const result = await connection.query(sql);
      let suppliers = result.rows;

      // 🔹 Reordenar imágenes según el campo JSON 'files'
      suppliers = suppliers.map(s => {
        const filesJson = s.files || [];
        let orderedImages = [];

        if (filesJson.length > 0) {
          orderedImages = filesJson.map(fj => {
            const match = s.images.find(img => img.id === fj.id);
            return { ...fj, ...(match || {}) };
          });
        } else {
          orderedImages = s.images;
        }

        return { ...s, images: orderedImages };
      });

      if (suppliers.length === 0) {
        return {
          status: false,
          code: 404,
          msg: "No se encontraron proveedores"
        };
      }

      return {
        status: true,
        code: 200,
        data: suppliers
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
          datos_bancarios,
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

      if (!data.nombre || !data.datos_bancarios) {
        return {
          status: false,
          code: 400,
          msg: "Nombre y datos bancarios son obligatorios"
        };
      }

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
          datos_bancarios,
          files,
          estatus
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,
        [
          data.nombre,
          data.documento || null,
          data.telefono || null,
          data.email || null,
          data.datos_bancarios, // 👈 ya no permitimos null
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

      const allowedFields = [
        "nombre",
        "documento",
        "telefono",
        "email",
        "datos_bancarios",
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

  static async saveImages(id_proveedor, files) {
    let connection;
    try {
      connection = await pool.connect();

      if (!files || files.length === 0) {
        return { status: true, msg: "No files to save", data: [] };
      }

      // Construcción dinámica de múltiples inserts
      const values = [];
      const rows = files.map((f, i) => {
        const offset = i * 5;

        values.push(
          id_proveedor,
          f.originalname,
          f.buffer,
          f.mimetype,
          i === 0 // La primera imagen será la principal
        );

        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      });

      const sqlInsert = `
        INSERT INTO proveedores_images 
        (proveedor_id, nombre_file, data, mime_type, is_main)
        VALUES ${rows.join(", ")}
        RETURNING id, nombre_file, is_main
      `;

      const result = await connection.query(sqlInsert, values);

      return {
        status: true,
        msg: `${result.rowCount} images saved successfully`,
        code: 201,
        data: result.rows,
      };

    } catch (error) {
      console.error("❌ Error en Proveedores.saveImages:", error);
      return {
        status: false,
        msg: "Error saving images",
        code: 500,
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async orderFiles(id_proveedor, filesJson) {
    let connection;
    try {
      connection = await pool.connect();

      // Guardar el JSON del orden en la tabla proveedores
      await connection.query(
        `UPDATE proveedores SET files = $1 WHERE id = $2`,
        [JSON.stringify(filesJson), id_proveedor]
      );

      // Buscar el que tenga order === 1 (portada)
      const portada = filesJson.find(f => f.order === 1);

      if (portada?.id) {
        // Quitar principal a todas las imágenes del proveedor
        await connection.query(
          `UPDATE proveedores_images SET is_main = false WHERE proveedor_id = $1`,
          [id_proveedor]
        );

        // Marcar como principal la imagen seleccionada
        await connection.query(
          `UPDATE proveedores_images SET is_main = true WHERE id = $1`,
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
    let connection
    try {
      connection = await pool.connect()
      await connection.query(
        `DELETE FROM proveedores_images WHERE id = ANY($1::int[])`,
        [ids]
      )
      return { status: true }
    } catch (error) {
      return { status: false, error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }
}
