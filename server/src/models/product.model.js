// models/product.model.js
import pool from "../connection/db.connect.js";

export class ProductsModel {
  /* ================= PRODUCTOS ================= */
  static async getAllProducts() {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
      SELECT 
        p.*,
        c.nombre AS categoria,
        m.nombre AS marca,
        COALESCE(SUM(i.existencia_general), 0) AS existencia_general,
        i.nro_serie,
        i.costo_unitario,
        i.precio_venta,
        i.margen_ganancia,
        i.stock_minimo_general
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN marcas m ON p.id_marca = m.id
      LEFT JOIN LATERAL (
        SELECT *
        FROM inventario i2
        WHERE i2.id_producto = p.id
        AND i2.estatus = TRUE
        ORDER BY i2.fecha_creacion DESC
        LIMIT 1
      ) i ON true
      WHERE p.estatus = TRUE
      GROUP BY 
        p.id, c.nombre, m.nombre, 
        i.nro_serie, i.costo_unitario, i.precio_venta, i.margen_ganancia, i.stock_minimo_general
      ORDER BY p.id DESC
    `);

      if (!result.rows.length) {
        return { status: false, code: 404, msg: "No se encontraron productos" };
      }

      return { status: true, code: 200, data: result.rows };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener productos",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async getProductById(id) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(
        `
      SELECT 
        p.*,
        c.nombre AS categoria,
        m.nombre AS marca,
        i.nro_serie,
        i.existencia_general,
        i.costo_unitario,
        i.precio_venta,
        i.margen_ganancia,
        i.stock_minimo_general
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      LEFT JOIN marcas m ON p.id_marca = m.id
      LEFT JOIN LATERAL (
        SELECT *
        FROM inventario i
        WHERE i.id_producto = p.id
        AND i.estatus = TRUE
        ORDER BY i.fecha_creacion DESC
        LIMIT 1
      ) i ON true
      WHERE p.id = $1
    `,
        [id],
      );

      if (!result.rows.length) {
        return { status: false, code: 404, msg: "Producto no encontrado" };
      }

      return { status: true, code: 200, data: result.rows[0] };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener producto",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async getProductAudById(id) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(
        `
      SELECT
        p.id          AS producto_id,
        p.descripcion,

        a.id          AS auditoria_id,
        a.entidad,
        a.id_entidad,
        a.accion,
        a.fecha,

        u.id          AS usuario_id,
        u.nombre      AS usuario_nombre,
        u.email       AS usuario_email,
        u.rol         AS usuario_rol,

        (a.datos_previos ->> 'costo_unitario')::DECIMAL  AS costo_unitario_anterior,
        (a.datos_nuevos  ->> 'costo_unitario')::DECIMAL  AS costo_unitario_nuevo,

        (a.datos_previos ->> 'precio_venta')::DECIMAL   AS precio_venta_anterior,
        (a.datos_nuevos  ->> 'precio_venta')::DECIMAL   AS precio_venta_nuevo,

        (a.datos_previos ->> 'margen_ganancia')::DECIMAL AS margen_ganancia_anterior,
        (a.datos_nuevos  ->> 'margen_ganancia')::DECIMAL AS margen_ganancia_nuevo

      FROM productos p
      INNER JOIN auditoria a
        ON a.entidad = 'inventario'
        AND a.id_entidad = p.id
      LEFT JOIN usuarios u ON u.id = a.usuario_id

      WHERE p.id = $1
        AND (
          (a.datos_previos::jsonb) ?| ARRAY['precio_venta','costo_unitario','margen_ganancia']
          OR
          (a.datos_nuevos::jsonb)  ?| ARRAY['precio_venta','costo_unitario','margen_ganancia']
        )

      ORDER BY a.fecha DESC
      `,
        [id],
      );

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "No existe auditoría para este producto",
        };
      }

      return {
        status: true,
        code: 200,
        data: result.rows,
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener auditoría del producto",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createProduct(data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      // 1️⃣ Validar duplicado
      const duplicate = await connection.query(
        `SELECT id FROM productos WHERE LOWER(descripcion) = LOWER($1)`,
        [data.descripcion],
      );

      if (duplicate.rows.length) {
        await connection.query("ROLLBACK");
        return { status: false, code: 409, msg: "El producto ya existe" };
      }

      // 2️⃣ Crear producto
      const productResult = await connection.query(
        `INSERT INTO productos (descripcion, id_categoria, id_marca, files)
        VALUES ($1,$2,$3,$4)
        RETURNING *`,
        [data.descripcion, data.id_categoria, data.id_marca, null],
      );

      const producto = productResult.rows[0];

      // 3️⃣ Crear inventario
      const invResult = await connection.query(
        `INSERT INTO inventario (
          id_producto,
          nro_serie,
          existencia_general,
          costo_unitario,
          precio_venta,
          margen_ganancia,
          stock_minimo_general
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
        [
          producto.id,
          data.nro_serie,
          data.existencia_general,
          data.costo_unitario,
          data.precio_venta,
          data.margen_ganancia,
          data.stock_minimo_general,
        ],
      );

      const inventario = invResult.rows[0];

      await connection.query("COMMIT");

      return {
        status: true,
        code: 201,
        msg: "Producto e inventario creados correctamente",
        data: data,
      };
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return {
        status: false,
        code: 500,
        msg: "Error al crear producto",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateProduct(id, data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      // 1️⃣ Validar producto
      const exists = await connection.query(
        `SELECT id FROM productos WHERE id=$1`,
        [id],
      );

      if (!exists.rows.length) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "Producto no encontrado" };
      }

      let productoActualizado = null;
      let inventarioActualizado = null;

      // 2️⃣ Producto
      const productoFields = ["descripcion", "id_categoria", "id_marca"];
      const productoData = Object.fromEntries(
        Object.entries(data).filter(([k]) => productoFields.includes(k)),
      );

      if (Object.keys(productoData).length) {
        const keys = Object.keys(productoData);
        const values = Object.values(productoData);

        const result = await connection.query(
          `UPDATE productos SET ${keys
            .map((k, i) => `${k}=$${i + 1}`)
            .join(", ")}
         WHERE id=$${keys.length + 1}
         RETURNING *`,
          [...values, id],
        );

        productoActualizado = result.rows[0];
      }

      // 3️⃣ Inventario previo (snapshot completo para auditoría)
      const inventarioPrevioResult = await connection.query(
        `SELECT 
         costo_unitario,
         margen_ganancia,
         precio_venta
       FROM inventario
       WHERE id_producto=$1`,
        [id],
      );

      if (!inventarioPrevioResult.rows.length) {
        await connection.query("ROLLBACK");
        return {
          status: false,
          code: 404,
          msg: "Inventario no encontrado",
        };
      }

      const inventarioPrevio = inventarioPrevioResult.rows[0];

      // 4️⃣ Inventario
      const inventarioFields = [
        "nro_serie",
        "existencia_general",
        "costo_unitario",
        "precio_venta",
        "margen_ganancia",
        "stock_minimo_general",
      ];

      const inventarioData = Object.fromEntries(
        Object.entries(data).filter(([k]) => inventarioFields.includes(k)),
      );

      if (Object.keys(inventarioData).length) {
        const keys = Object.keys(inventarioData);
        const values = Object.values(inventarioData);

        const result = await connection.query(
          `UPDATE inventario SET ${keys
            .map((k, i) => `${k}=$${i + 1}`)
            .join(", ")}
         WHERE id_producto=$${keys.length + 1}
         RETURNING *`,
          [...values, id],
        );

        inventarioActualizado = result.rows[0];
      }

      // 5️⃣ Auditoría (si cambia costo, margen o precio)
      const costoNuevo =
        data.costo_unitario !== undefined
          ? Number(data.costo_unitario)
          : Number(inventarioPrevio.costo_unitario);

      const margenNuevo =
        data.margen_ganancia !== undefined
          ? Number(data.margen_ganancia)
          : Number(inventarioPrevio.margen_ganancia);

      const precioNuevo =
        data.precio_venta !== undefined
          ? Number(data.precio_venta)
          : Number(inventarioPrevio.precio_venta);

      const hayCambios =
        costoNuevo !== Number(inventarioPrevio.costo_unitario) ||
        margenNuevo !== Number(inventarioPrevio.margen_ganancia) ||
        precioNuevo !== Number(inventarioPrevio.precio_venta);

      if (hayCambios) {
        await connection.query(
          `INSERT INTO auditoria (
          entidad,
          id_entidad,
          accion,
          datos_previos,
          datos_nuevos,
          usuario_id
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            "inventario",
            id,
            "ACTUALIZACION_COSTO_MARGEN_PRECIO",
            JSON.stringify({
              costo_unitario: inventarioPrevio.costo_unitario,
              margen_ganancia: inventarioPrevio.margen_ganancia,
              precio_venta: inventarioPrevio.precio_venta,
            }),
            JSON.stringify({
              costo_unitario: costoNuevo,
              margen_ganancia: margenNuevo,
              precio_venta: precioNuevo,
            }),
            data.usuario_id,
          ],
        );
      }

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Producto e inventario actualizados correctamente",
        data: {
          ...(productoActualizado || {}),
          ...(inventarioActualizado || {}),
          id: productoActualizado?.id ?? id,
        },
      };
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar producto",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteProduct(id) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      // 1️⃣ Eliminar inventario
      const invDelete = await connection.query(
        `DELETE FROM inventario WHERE id_producto=$1`,
        [id],
      );

      // 2️⃣ Eliminar producto
      const productDelete = await connection.query(
        `DELETE FROM productos WHERE id=$1 RETURNING id`,
        [id],
      );

      if (!productDelete.rowCount) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "Producto no encontrado" };
      }

      // 3️⃣ Confirmar
      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Producto e inventario eliminados correctamente",
      };
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar producto",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= Productos + Existencias en Deposito ================= */
  static async getProductWithDeposits(id) {
    let connection;
    try {
      connection = await pool.connect();

      const productResult = await connection.query(
        `SELECT * FROM productos WHERE id=$1`,
        [id],
      );
      if (!productResult.rows.length)
        return { status: false, code: 404, msg: "Producto no encontrado" };

      const depositsResult = await connection.query(
        `SELECT d.id AS id_deposito, e.id_producto, d.nombre AS deposito_nombre, e.existencia_deposito, e.stock_minimo_deposito, e.estatus
        FROM edeposito e
        JOIN depositos d ON e.id_deposito = d.id
        WHERE e.id_producto = $1`,
        [id],
      );

      const product = productResult.rows[0];
      product.depositos = depositsResult.rows;

      return { status: true, code: 200, data: depositsResult.rows };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener producto",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createEdeposit({
    id_producto,
    id_deposito,
    existencia_deposito,
    stock_minimo_deposito,
  }) {
    let connection;
    try {
      connection = await pool.connect();

      if (existencia_deposito < 0)
        return {
          status: false,
          code: 400,
          msg: "La existencia no puede ser negativa",
        };

      // evitar duplicados producto + depósito
      const exists = await connection.query(
        `SELECT 1 FROM edeposito WHERE id_producto=$1 AND id_deposito=$2`,
        [id_producto, id_deposito],
      );

      if (exists.rows.length)
        return {
          status: false,
          code: 409,
          msg: "Ya existe un registro para este producto en el depósito",
        };

      const result = await connection.query(
        `INSERT INTO edeposito (
        id_producto, 
        id_deposito, 
        existencia_deposito, 
        stock_minimo_deposito, 
        estatus
      )
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
        [id_producto, id_deposito, existencia_deposito, stock_minimo_deposito],
      );

      return { status: true, code: 201, data: result.rows[0] };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear existencia en depósito",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async editEdeposit({
    id_producto,
    id_deposito,
    existencia_deposito,
    stock_minimo_deposito,
  }) {
    let connection;
    try {
      connection = await pool.connect();

      if (existencia_deposito < 0)
        return {
          status: false,
          code: 400,
          msg: "La existencia no puede ser negativa",
        };

      const updateResult = await connection.query(
        `UPDATE edeposito 
       SET 
         existencia_deposito = $1,
         stock_minimo_deposito = $2
       WHERE id_producto = $3 
         AND id_deposito = $4
         AND estatus = TRUE
       RETURNING *`,
        [existencia_deposito, stock_minimo_deposito, id_producto, id_deposito],
      );

      if (!updateResult.rows.length)
        return { status: false, code: 404, msg: "Existencia no encontrada" };

      return { status: true, code: 200, data: updateResult.rows[0] };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al editar existencia",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteEdeposit(id_producto, id_deposito) {
    let connection;
    try {
      connection = await pool.connect();

      const deleteResult = await connection.query(
        `UPDATE edeposito 
       SET estatus = FALSE
       WHERE id_producto = $1 
         AND id_deposito = $2
       RETURNING *`,
        [id_producto, id_deposito],
      );

      if (!deleteResult.rows.length)
        return { status: false, code: 404, msg: "Existencia no encontrada" };

      return {
        status: true,
        code: 200,
        msg: "Existencia desactivada correctamente",
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar existencia",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= CATEGORIAS ================= */
  static async getAllCategories() {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `SELECT * FROM categorias ORDER BY id DESC`,
      );
      if (!result.rows.length)
        return {
          status: false,
          code: 404,
          msg: "No se encontraron categorias",
        };
      return { status: true, code: 200, data: result.rows };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener categorias",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async getCategoryById(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `SELECT * FROM categorias WHERE id=$1`,
        [id],
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "Categoria no encontrada" };
      return { status: true, code: 200, data: result.rows[0] };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener categoria",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createCategory(data) {
    let connection;
    try {
      connection = await pool.connect();
      console.log("consulta de crear categoria");
      const duplicate = await connection.query(
        `SELECT id FROM categorias WHERE LOWER(nombre)=LOWER($1)`,
        [data.nombre],
      );
      console.log(duplicate);
      if (duplicate.rows.length)
        return { status: false, code: 409, msg: "La categoria ya existe" };
      const insert = await connection.query(
        `INSERT INTO categorias (nombre, estatus) VALUES ($1,$2) RETURNING *`,
        [data.nombre, data.estatus ?? true],
      );
      return {
        status: true,
        code: 201,
        msg: "Categoria creada correctamente",
        data: insert.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear categoria",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateCategory(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      const fields = Object.keys(data);
      if (!fields.length)
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar",
        };
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(",");
      const result = await connection.query(
        `UPDATE categorias SET ${setClause} WHERE id=$${fields.length + 1} RETURNING *`,
        [...values, id],
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "Categoria no encontrada" };
      return {
        status: true,
        code: 200,
        msg: "Categoria actualizada correctamente",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar categoria",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteCategory(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `DELETE FROM categorias WHERE id=$1 RETURNING id`,
        [id],
      );
      if (!result.rowCount)
        return { status: false, code: 404, msg: "Categoria no encontrada" };
      return {
        status: true,
        code: 200,
        msg: "Categoria eliminada correctamente",
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar categoria",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= MARCAS ================= */
  static async getAllBrands() {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `SELECT * FROM marcas ORDER BY id DESC`,
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "No se encontraron marcas" };
      return { status: true, code: 200, data: result.rows };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener marcas",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async getBrandById(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `SELECT * FROM marcas WHERE id=$1`,
        [id],
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "Marca no encontrada" };
      return { status: true, code: 200, data: result.rows[0] };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener marca",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createBrand(data) {
    let connection;
    try {
      connection = await pool.connect();
      const duplicate = await connection.query(
        `SELECT id FROM marcas WHERE LOWER(nombre)=LOWER($1)`,
        [data.nombre],
      );
      if (duplicate.rows.length)
        return { status: false, code: 409, msg: "La marca ya existe" };
      const insert = await connection.query(
        `INSERT INTO marcas (nombre, estatus) VALUES ($1,$2) RETURNING *`,
        [data.nombre, data.estatus ?? true],
      );
      return {
        status: true,
        code: 201,
        msg: "Marca creada correctamente",
        data: insert.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear marca",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateBrand(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      const fields = Object.keys(data);
      if (!fields.length)
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar",
        };
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(",");
      const result = await connection.query(
        `UPDATE marcas SET ${setClause} WHERE id=$${fields.length + 1} RETURNING *`,
        [...values, id],
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "Marca no encontrada" };
      return {
        status: true,
        code: 200,
        msg: "Marca actualizada correctamente",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar marca",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteBrand(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `DELETE FROM marcas WHERE id=$1 RETURNING id`,
        [id],
      );
      if (!result.rowCount)
        return { status: false, code: 404, msg: "Marca no encontrada" };
      return { status: true, code: 200, msg: "Marca eliminada correctamente" };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar marca",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= LOTES ================= */
  static async getAllLotes() {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT 
          l.id,
          l.id_producto,
          p.descripcion AS producto,
          l.nro_lote,
          l.fecha_vencimiento,
          l.estatus,
          l.fecha_creacion
        FROM lotes l
        INNER JOIN productos p ON p.id = l.id_producto
        ORDER BY l.id DESC
      `);

      if (!result.rows.length) {
        return { status: false, code: 404, msg: "No se encontraron lotes" };
      }

      return { status: true, code: 200, data: result.rows };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener lotes",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

static async getLotesProductoById(id_producto) {
  let connection;
  try {
    connection = await pool.connect();

    const result = await connection.query(
      `
      SELECT 
        l.id,
        l.id_producto,
        p.descripcion AS producto,
        l.nro_lote,
        l.fecha_vencimiento,
        l.estatus,
        l.fecha_creacion,

        d.id AS deposito_id,
        d.nombre AS deposito_nombre

      FROM lotes l
      INNER JOIN productos p 
        ON p.id = l.id_producto
      INNER JOIN depositos d
        ON d.id = l.id_deposito

      WHERE l.id_producto = $1
      ORDER BY l.id DESC
      `,
      [id_producto],
    );

    if (!result.rows.length) {
      return {
        status: false,
        code: 404,
        msg: "No se encontraron lotes para este producto",
      };
    }

    return { status: true, code: 200, data: result.rows };
  } catch (error) {
    return {
      status: false,
      code: 500,
      msg: "Error al obtener lotes",
      error: error.message,
    };
  } finally {
    if (connection) connection.release();
  }
}


  static async createLote(data) {
    let connection;
    try {
      connection = await pool.connect();
      const duplicate = await connection.query(
        `SELECT id FROM lotes WHERE id_producto=$1 AND LOWER(nro_lote)=LOWER($2)`,
        [data.id_producto, data.nro_lote],
      );
      if (duplicate.rows.length)
        return {
          status: false,
          code: 409,
          msg: "El lote ya existe para este producto",
        };
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
      const insert = await connection.query(
        `INSERT INTO lotes (${keys.join(",")}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      return {
        status: true,
        code: 201,
        msg: "Lote creado correctamente",
        data: insert.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear lote",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateLote(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      const fields = Object.keys(data);
      if (!fields.length)
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar",
        };
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(",");
      const result = await connection.query(
        `UPDATE lotes SET ${setClause} WHERE id=$${fields.length + 1} RETURNING *`,
        [...values, id],
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "Lote no encontrado" };
      return {
        status: true,
        code: 200,
        msg: "Lote actualizado correctamente",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar lote",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteLote(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `DELETE FROM lotes WHERE id=$1 RETURNING id`,
        [id],
      );
      if (!result.rowCount)
        return { status: false, code: 404, msg: "Lote no encontrado" };
      return { status: true, code: 200, msg: "Lote eliminado correctamente" };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar lote",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= INVENTARIO ================= */
  static async getAllInventory(productId) {
    let connection;
    try {
      connection = await pool.connect();

      const query = `
        SELECT 
          i.id AS inventario_id,
          i.id_oficina,
          z.nombre AS oficina_nombre,
          i.nro_serie,
          i.existencia_general,
          i.costo_unitario,
          i.precio_venta,
          i.margen_ganancia,
          i.stock_minimo_general,
          i.estatus AS inventario_estatus,
          i.fecha_creacion AS inventario_fecha,

          l.id AS lote_id,
          l.nro_lote,
          l.fecha_vencimiento,
          l.estatus AS lote_estatus,

          p.id AS id_producto,
          p.descripcion AS producto_descripcion,
          p.id_categoria,
          p.id_marca

        FROM productos p
        INNER JOIN lotes l 
          ON l.id_producto = p.id
        INNER JOIN inventario i 
          ON i.id_lote = l.id
        INNER JOIN zonas z
          ON z.id = i.id_oficina

        WHERE p.id = $1
        ORDER BY i.id DESC
      `;

      const result = await connection.query(query, [productId]);

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "No se encontraron inventarios para este producto",
        };
      }

      return {
        status: true,
        code: 200,
        data: result.rows,
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener inventario",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createInventory(data) {
    let connection;
    try {
      connection = await pool.connect();
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
      const insert = await connection.query(
        `INSERT INTO inventario (${keys.join(",")}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      return {
        status: true,
        code: 201,
        msg: "Inventario creado correctamente",
        data: insert.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear inventario",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateInventory(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      const fields = Object.keys(data);
      if (!fields.length)
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar",
        };
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(",");
      const result = await connection.query(
        `UPDATE inventario SET ${setClause} WHERE id=$${fields.length + 1} RETURNING *`,
        [...values, id],
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "Inventario no encontrado" };
      return {
        status: true,
        code: 200,
        msg: "Inventario actualizado correctamente",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar inventario",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteInventory(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `DELETE FROM inventario WHERE id=$1 RETURNING id`,
        [id],
      );
      if (!result.rowCount)
        return { status: false, code: 404, msg: "Inventario no encontrado" };
      return {
        status: true,
        code: 200,
        msg: "Inventario eliminado correctamente",
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar inventario",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= DEPOSITOS ================= */
  static async getAllDeposits() {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `SELECT * FROM edeposito ORDER BY id DESC`,
      );
      if (!result.rows.length)
        return {
          status: false,
          code: 404,
          msg: "No se encontraron registros de deposito",
        };
      return { status: true, code: 200, data: result.rows };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener depositos",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createDeposit(data) {
    let connection;
    try {
      connection = await pool.connect();
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
      const insert = await connection.query(
        `INSERT INTO edeposito (${keys.join(",")}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      return {
        status: true,
        code: 201,
        msg: "Deposito creado correctamente",
        data: insert.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear deposito",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateDeposit(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      const fields = Object.keys(data);
      if (!fields.length)
        return {
          status: false,
          code: 400,
          msg: "No se enviaron datos para actualizar",
        };
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `${f}=$${i + 1}`).join(",");
      const result = await connection.query(
        `UPDATE edeposito SET ${setClause} WHERE id=$${fields.length + 1} RETURNING *`,
        [...values, id],
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "Deposito no encontrado" };
      return {
        status: true,
        code: 200,
        msg: "Deposito actualizado correctamente",
        data: result.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al actualizar deposito",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async deleteDeposit(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `DELETE FROM edeposito WHERE id=$1 RETURNING id`,
        [id],
      );
      if (!result.rowCount)
        return { status: false, code: 404, msg: "Deposito no encontrado" };
      return {
        status: true,
        code: 200,
        msg: "Deposito eliminado correctamente",
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al eliminar deposito",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= KARDEX GENERAL ================= */
  static async getAllKardexG() {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `SELECT * FROM kardexg ORDER BY id DESC`,
      );
      if (!result.rows.length)
        return {
          status: false,
          code: 404,
          msg: "No se encontraron registros de kardex general",
        };
      return { status: true, code: 200, data: result.rows };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener kardex general",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createKardexG(data) {
    let connection;
    try {
      connection = await pool.connect();
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
      const insert = await connection.query(
        `INSERT INTO kardexg (${keys.join(",")}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      return {
        status: true,
        code: 201,
        msg: "Kardex general creado correctamente",
        data: insert.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear kardex general",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= KARDEX DEPOSITO ================= */
  static async getAllKardexDep() {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        `SELECT * FROM kardexdep ORDER BY id DESC`,
      );
      if (!result.rows.length)
        return {
          status: false,
          code: 404,
          msg: "No se encontraron registros de kardex deposito",
        };
      return { status: true, code: 200, data: result.rows };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener kardex deposito",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }

  static async createKardexDep(data) {
    let connection;
    try {
      connection = await pool.connect();
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
      const insert = await connection.query(
        `INSERT INTO kardexdep (${keys.join(",")}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      return {
        status: true,
        code: 201,
        msg: "Kardex deposito creado correctamente",
        data: insert.rows[0],
      };
    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al crear kardex deposito",
        error: error.message,
      };
    } finally {
      if (connection) connection.release();
    }
  }
}
