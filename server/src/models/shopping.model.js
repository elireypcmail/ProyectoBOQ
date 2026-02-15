// models/product.model.js
import pool from "../connection/db.connect.js";

const parseMonto = (valor) => {
  if (!valor) return 0;
  if (typeof valor === 'number') return valor;
  return parseFloat(valor.toString().replace(/\./g, '').replace(',', '.'));
};

const addDays = (dateStr, days) => {
  const result = new Date(dateStr);
  result.setDate(result.getDate() + parseInt(days || 0));
  return result.toISOString().split('T')[0];
};


export class ShoppingModel {
  /* ================= PRODUCTOS ================= */
  static async getAllShoping() {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
      SELECT 
        p.*,
        c.nombre AS categoria,
        m.nombre AS marca,
        COALESCE(SUM(i.existencia_general), 0) AS existencia_general,
        i.sku,
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
        i.sku, i.costo_unitario, i.precio_venta, i.margen_ganancia, i.stock_minimo_general
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

  static async getShoppingById(id) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(
        `
      SELECT 
        p.*,
        c.nombre AS categoria,
        m.nombre AS marca,
        i.sku,
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

// Helpers internos

  static async createShopping(data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const {
        id_proveedor,
        nro_factura,
        fecha_emision,
        dias_plazo = 0,
        id_deposito_destino,
        id_usuario,
        items,           // Array: { Producto, Cant, Costo_Base, Costo_Ficha, ... }
        detalle_lotes,   // Array: { nro_lote, cantidad, fecha_vencimiento, Producto }
        totales_cargos   // Objeto con cargos_monto, subtotal, etc.
      } = data;

      // 1️⃣ Cálculos Iniciales de Cabecera (Punto 2.2 - 4)
      const fechaVencimiento = data.fecha_vencimiento || addDays(fecha_emision, dias_plazo);
      const m_cargos = parseMonto(totales_cargos?.cargos_monto);
      const m_subtotal = parseMonto(totales_cargos?.subtotal);
      const m_total = parseMonto(totales_cargos?.total);
      const m_descuento_extra = parseMonto(totales_cargos?.monto_descuento_extra);

      // 2️⃣ Prorrateo del Cargo (Punto 2.2 - 3)
      let totalUnidadesFactura = 0;
      items.forEach(item => totalUnidadesFactura += parseMonto(item.Cant));
      const cargoPorUnidad = totalUnidadesFactura > 0 ? (m_cargos / totalUnidadesFactura) : 0;

      // 3️⃣ Crear Cabecera de Compra
      const compraResult = await connection.query(
        `INSERT INTO compras (
          id_proveedor, nro_factura, fecha_emision, dias_plazo, fecha_vencimiento,
          subtotal1, descuento, cargo, total, abonado, estado_pago
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [id_proveedor, nro_factura, fecha_emision, dias_plazo, fechaVencimiento, 
        m_subtotal, m_descuento_extra, m_cargos, m_total, 0, 'PENDIENTE']
      );
      const idCompra = compraResult.rows[0].id;

      // 4️⃣ Registro en INGRESOS_EGRESOS (Punto 2.2 - 5)
      await connection.query(
        `INSERT INTO ingresos_egresos (fecha, monto, id_compra, id_usuario) VALUES ($1, $2, $3, $4)`,
        [fecha_emision, m_total, idCompra, id_usuario]
      );

      // 5️⃣ Procesar cada Producto
      for (const item of items) {
        const cantidadComp = parseMonto(item.Cant);
        const costoBase = parseMonto(item.Costo_Base);
        // Costo con descuentos + cargo prorrateado (Punto 2.2 - 3)
        const costoFinal = parseMonto(item.Costo_Ficha) + cargoPorUnidad;

        // Obtener inventario actual
        const invQuery = await connection.query(
          `SELECT i.* FROM inventario i JOIN productos p ON i.id_producto = p.id 
          WHERE p.descripcion = $1`, [item.Producto]
        );
        if (invQuery.rows.length === 0) throw new Error(`Producto ${item.Producto} no existe.`);
        
        const inv = invQuery.rows[0];
        const nuevoPrecio = costoFinal * (1 + (parseFloat(inv.margen_ganancia) / 100));

        // Actualizar Ficha de Inventario
        await connection.query(
          `UPDATE inventario SET costo_unitario = $1, precio_venta = $2, 
          existencia_general = existencia_general + $3 WHERE id = $4`,
          [costoFinal, nuevoPrecio, cantidadComp, inv.id]
        );

        // Auditorías (Costo y Precio)
        await connection.query(
          `INSERT INTO auditoria (entidad, id_entidad, accion, datos_previos, datos_nuevos, usuario_id)
          VALUES ('inventario', $1, 'CAMBIO_COSTO_PRECIO', $2, $3, $4)`,
          [inv.id, JSON.stringify({costo: inv.costo_unitario, precio: inv.precio_venta}), 
          JSON.stringify({costo: costoFinal, precio: nuevoPrecio}), id_usuario]
        );

        // Aumentar existencia en depósito (edeposito)
        await connection.query(
          `UPDATE edeposito SET existencia_deposito = existencia_deposito + $1 
          WHERE id_producto = $2 AND id_deposito = $3`,
          [cantidadComp, inv.id_producto, id_deposito_destino]
        );

        // Registro en Kardex General
        await connection.query(
          `INSERT INTO kardexg (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
          VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9, 'COMPRA')`,
          [inv.id_producto, fecha_emision, inv.existencia_general, cantidadComp, 
          (parseInt(inv.existencia_general) + cantidadComp), costoFinal, nuevoPrecio, `Compra Fac: ${nro_factura}`, nro_factura]
        );

        // Crear Detalle de Compra
        const detRes = await connection.query(
          `INSERT INTO compras_detalle (id_compra, id_inventario, descripcion, cantidad, costo_compra, costo_unitario_final, cargo_unitario)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [idCompra, inv.id, item.Producto, cantidadComp, costoBase, costoFinal, cargoPorUnidad]
        );
        const idDetalle = detRes.rows[0].id;

        // 6️⃣ Manejo de Lotes (Punto 2.2 - 3 y 4)
        if (detalle_lotes && Array.isArray(detalle_lotes)) {
          const lotesProducto = detalle_lotes.filter(l => l.Producto === item.Producto);
          let sumaCantLotes = 0;

          for (const lote of lotesProducto) {
            const cLote = parseMonto(lote.cantidad);
            sumaCantLotes += cLote;

            const loteExist = await connection.query(
              `SELECT id FROM lotes WHERE nro_lote = $1 AND id_producto = $2 AND id_deposito = $3`,
              [lote.nro_lote, inv.id_producto, id_deposito_destino]
            );

            let idLote;
            if (loteExist.rows.length > 0) {
              idLote = loteExist.rows[0].id;
              await connection.query(`UPDATE lotes SET cantidad = cantidad + $1 WHERE id = $2`, [cLote, idLote]);
            } else {
              const nl = await connection.query(
                `INSERT INTO lotes (id_producto, id_deposito, nro_lote, cantidad, fecha_vencimiento)
                VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [inv.id_producto, id_deposito_destino, lote.nro_lote, cLote, lote.fecha_vencimiento]
              );
              idLote = nl.rows[0].id;
            }
            await connection.query(
              `INSERT INTO compras_detalle_lote (id_detalle, id_lote, cantidad, fecha_caducidad) VALUES ($1, $2, $3, $4)`,
              [idDetalle, idLote, cLote, lote.fecha_vencimiento]
            );
          }

          if (sumaCantLotes > cantidadComp) {
            throw new Error(`La cantidad de lotes (${sumaCantLotes}) para ${item.Producto} supera la compra (${cantidadComp})`);
          }
        }
      }

      await connection.query("COMMIT");
      return { status: true, code: 201, msg: "Factura de compra procesada correctamente." };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return { status: false, code: 500, msg: "Error al procesar la compra", error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateShopping(id, data) {
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
        "sku",
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

  static async deleteShopping(id) {
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
}