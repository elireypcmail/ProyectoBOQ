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

        COALESCE(SUM(i.existencia_general), 0) AS existencia_general

      FROM productos p
      LEFT JOIN categorias c 
        ON p.id_categoria = c.id
      LEFT JOIN marcas m 
        ON p.id_marca = m.id
      LEFT JOIN lotes l
        ON l.id_producto = p.id
      LEFT JOIN inventario i
        ON i.id_lote = l.id
        AND i.estatus = TRUE

      GROUP BY 
        p.id,
        c.nombre,
        m.nombre

      ORDER BY p.id DESC
    `);

    if (!result.rows.length)
      return { status: false, code: 404, msg: "No se encontraron productos" };

    return { status: true, code: 200, data: result.rows };

  } catch (error) {
    return { 
      status: false, 
      code: 500, 
      msg: "Error al obtener productos", 
      error: error.message 
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
        COALESCE(SUM(e.existencia_deposito), 0) AS existencia_general
      FROM productos p
      LEFT JOIN categorias c 
        ON p.id_categoria = c.id
      LEFT JOIN marcas m 
        ON p.id_marca = m.id
      LEFT JOIN edeposito e
        ON e.id_producto = p.id
        AND e.estatus = TRUE
      WHERE p.id = $1
      GROUP BY 
        p.id,
        c.nombre,
        m.nombre
      `,
      [id]
    );

    if (!result.rows.length)
      return { status: false, code: 404, msg: "Producto no encontrado" };

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


  static async createProduct(data) {
    let connection;
    try {
      connection = await pool.connect();

      const duplicate = await connection.query(
        `SELECT id FROM productos WHERE LOWER(descripcion)=LOWER($1)`,
        [data.descripcion],
      );
      if (duplicate.rows.length)
        return { status: false, code: 409, msg: "El producto ya existe" };

      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
      const insert = await connection.query(
        `INSERT INTO productos (${keys.join(",")}) VALUES (${placeholders}) RETURNING *`,
        values,
      );
      return {
        status: true,
        code: 201,
        msg: "Producto creado correctamente",
        data: insert.rows[0],
      };
    } catch (error) {
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
        `UPDATE productos SET ${setClause} WHERE id=$${fields.length + 1} RETURNING *`,
        [...values, id],
      );
      if (!result.rows.length)
        return { status: false, code: 404, msg: "Producto no encontrado" };
      return {
        status: true,
        code: 200,
        msg: "Producto actualizado correctamente",
        data: result.rows[0],
      };
    } catch (error) {
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
      const result = await connection.query(
        `DELETE FROM productos WHERE id=$1 RETURNING id`,
        [id],
      );
      if (!result.rowCount)
        return { status: false, code: 404, msg: "Producto no encontrado" };
      return {
        status: true,
        code: 200,
        msg: "Producto eliminado correctamente",
      };
    } catch (error) {
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
          l.fecha_creacion
        FROM lotes l
        INNER JOIN productos p ON p.id = l.id_producto
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
