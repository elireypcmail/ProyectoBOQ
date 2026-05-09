// models/transfers.model.js
import pool from "../connection/db.connect.js";

const parseMonto = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  return parseFloat(val.toString().replace(",", ".")) || 0;
};

export class TransfersModel {
  static async createTraslado(data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const { id_usuario, motivo, items } = data;

      if (!items || items.length === 0) {
        throw new Error("Debe incluir al menos un ítem en el traslado.");
      }

      // ── 1. Cabecera del traslado
      const headerRes = await connection.query(
        `INSERT INTO traslados (id_usuario, motivo, fecha_creacion)
         VALUES ($1, $2, NOW()) RETURNING id`,
        [id_usuario, motivo || "Traslado de existencia"]
      );
      const idTraslado = headerRes.rows[0].id;

      // ── 2. Procesar cada línea──
      for (const item of items) {
        const {
          id_producto_origen,
          id_deposito_origen,
          id_lote_origen,
          id_producto_destino,
          id_deposito_destino,
          nro_lote_destino,
          fecha_venc_destino,
        } = item;
        const cantidad = parseMonto(item.cantidad);

        if (cantidad <= 0) {
          throw new Error("La cantidad del traslado debe ser mayor a 0.");
        }

      // ── Obtener nombres de productos ─────────────────────────────
      const prodOrigenRes = await connection.query(
        `SELECT descripcion FROM productos WHERE id = $1`,
        [id_producto_origen]
      );

      const prodDestinoRes = await connection.query(
        `SELECT descripcion FROM productos WHERE id = $1`,
        [id_producto_destino]
      );

      const nombreProductoOrigen =
        prodOrigenRes.rows[0]?.descripcion || `ID ${id_producto_origen}`;

      const nombreProductoDestino =
        prodDestinoRes.rows[0]?.descripcion || `ID ${id_producto_destino}`;


        // ── 2a. Validar y obtener inventario ORIGEN 
        const invOrigenRes = await connection.query(
          `SELECT i.* FROM inventario i WHERE i.id_producto = $1 LIMIT 1`,
          [id_producto_origen]
        );
        if (invOrigenRes.rows.length === 0) {
          throw new Error(`Producto origen ID ${id_producto_origen} no tiene inventario.`);
        }
        const invOrigen = invOrigenRes.rows[0];

        // ── 2b. Validar stock en depósito ORIGEN ──
        const edepOrigenRes = await connection.query(
          `SELECT * FROM edeposito WHERE id_producto = $1 AND id_deposito = $2`,
          [id_producto_origen, id_deposito_origen]
        );
        if (edepOrigenRes.rows.length === 0) {
          throw new Error(
            `El producto ${id_producto_origen} no tiene existencia en el depósito ${id_deposito_origen}.`
          );
        }
        const edepOrigen = edepOrigenRes.rows[0];
        if (parseMonto(edepOrigen.existencia_deposito) < cantidad) {
          throw new Error(
            `Stock insuficiente en el depósito origen (disponible: ${edepOrigen.existencia_deposito}, requerido: ${cantidad}).`
          );
        }

        // ── 2c. Validar lote ORIGEN (si aplica) ───
        if (id_lote_origen) {
          const loteOrigenRes = await connection.query(
            `SELECT * FROM lotes WHERE id = $1 AND id_producto = $2 AND id_deposito = $3 AND estatus = TRUE`,
            [id_lote_origen, id_producto_origen, id_deposito_origen]
          );
          if (loteOrigenRes.rows.length === 0) {
            throw new Error(`Lote origen ID ${id_lote_origen} no encontrado o inactivo.`);
          }
          const loteOrigen = loteOrigenRes.rows[0];
          if (parseMonto(loteOrigen.cantidad) < cantidad) {
            throw new Error(
              `Cantidad insuficiente en el lote origen (disponible: ${loteOrigen.cantidad}, requerido: ${cantidad}).`
            );
          }

          // Descontar del lote origen
          await connection.query(
            `UPDATE lotes SET cantidad = cantidad - $1 WHERE id = $2`,
            [cantidad, id_lote_origen]
          );

          // Marcar lote como inactivo si llega a 0
          await connection.query(
            `UPDATE lotes SET estatus = FALSE WHERE id = $1 AND cantidad = 0`,
            [id_lote_origen]
          );
        }

        // ── 2d. Descontar stock en depósito ORIGEN ─
        await connection.query(
          `UPDATE edeposito SET existencia_deposito = existencia_deposito - $1
           WHERE id_producto = $2 AND id_deposito = $3`,
          [cantidad, id_producto_origen, id_deposito_origen]
        );

        // ── 2e. Descontar existencia general ORIGEN 
        await connection.query(
          `UPDATE inventario SET existencia_general = existencia_general - $1
           WHERE id_producto = $2`,
          [cantidad, id_producto_origen]
        );

        // ── 2f. Validar y obtener inventario DESTINO ──────────────────────
        const invDestinoRes = await connection.query(
          `SELECT i.* FROM inventario i WHERE i.id_producto = $1 LIMIT 1`,
          [id_producto_destino]
        );
        if (invDestinoRes.rows.length === 0) {
          throw new Error(`Producto destino ID ${id_producto_destino} no tiene inventario.`);
        }
        const invDestino = invDestinoRes.rows[0];

        // ── 2g. Acreditar en depósito DESTINO (edeposito) ─────────────────
        const edepDestinoRes = await connection.query(
          `SELECT id FROM edeposito WHERE id_producto = $1 AND id_deposito = $2`,
          [id_producto_destino, id_deposito_destino]
        );
        if (edepDestinoRes.rows.length > 0) {
          await connection.query(
            `UPDATE edeposito SET existencia_deposito = existencia_deposito + $1
             WHERE id_producto = $2 AND id_deposito = $3`,
            [cantidad, id_producto_destino, id_deposito_destino]
          );
        } else {
          await connection.query(
            `INSERT INTO edeposito (id_producto, id_deposito, existencia_deposito, stock_minimo_deposito)
             VALUES ($1, $2, $3, 0)`,
            [id_producto_destino, id_deposito_destino, cantidad]
          );
        }

        // ── 2h. Acreditar en lote DESTINO (si el producto destino usa lotes) ──
        if (invDestino.estatus_lotes && nro_lote_destino) {
          const loteDestRes = await connection.query(
            `SELECT id FROM lotes
             WHERE nro_lote = $1 AND id_producto = $2 AND id_deposito = $3`,
            [nro_lote_destino, id_producto_destino, id_deposito_destino]
          );

          if (loteDestRes.rows.length > 0) {
            // Lote existente → sumar
            await connection.query(
              `UPDATE lotes SET cantidad = cantidad + $1, estatus = TRUE WHERE id = $2`,
              [cantidad, loteDestRes.rows[0].id]
            );
          } else {
            // Lote nuevo → crear
            await connection.query(
              `INSERT INTO lotes (id_producto, id_deposito, nro_lote, cantidad, fecha_vencimiento)
               VALUES ($1, $2, $3, $4, $5)`,
              [id_producto_destino, id_deposito_destino, nro_lote_destino, cantidad, fecha_venc_destino || null]
            );
          }
        }

        // ── 2i. Acreditar existencia general DESTINO ──────────────────────
        await connection.query(
          `UPDATE inventario SET existencia_general = existencia_general + $1
           WHERE id_producto = $2`,
          [cantidad, id_producto_destino]
        );

        // ── 2j. Kardex ORIGEN (salida) ─────────────
        const invOrigenActRes = await connection.query(
          `SELECT existencia_general FROM inventario WHERE id_producto = $1`,
          [id_producto_origen]
        );
        const existFinalOrigen = parseMonto(invOrigenActRes.rows[0]?.existencia_general);

        await connection.query(
          `INSERT INTO kardexg
            (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final,
             costo, precio, detalle, documento, tipo)
           VALUES ($1, NOW(), $2, 0, $3, $4, $5, $6, $7, $8, 'TRASLADO_SALIDA')`,
          [
            id_producto_origen,
            parseMonto(invOrigen.existencia_general),
            cantidad,
            existFinalOrigen,
            invOrigen.costo_unitario,
            invOrigen.precio_venta,
            `Traslado a producto ${nombreProductoDestino} | ${motivo || ""}`,
            `TRA-${idTraslado}`,
          ]
        );

        // ── 2k. Kardex DESTINO (entrada) ───────────
        const invDestinoActRes = await connection.query(
          `SELECT existencia_general FROM inventario WHERE id_producto = $1`,
          [id_producto_destino]
        );
        const existFinalDestino = parseMonto(invDestinoActRes.rows[0]?.existencia_general);

        await connection.query(
          `INSERT INTO kardexg
            (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final,
             costo, precio, detalle, documento, tipo)
           VALUES ($1, NOW(), $2, $3, 0, $4, $5, $6, $7, $8, 'TRASLADO_ENTRADA')`,
          [
            id_producto_destino,
            parseMonto(invDestino.existencia_general),
            cantidad,
            existFinalDestino,
            invDestino.costo_unitario,
            invDestino.precio_venta,
            `Traslado desde producto ${nombreProductoOrigen} | ${motivo || ""}`,
            `TRA-${idTraslado}`,
          ]
        );

        // ── 2l. Insertar detalle del traslado ──────
        await connection.query(
          `INSERT INTO traslados_detalle
            (id_traslado, id_producto_origen, id_deposito_origen, id_lote_origen,
             id_producto_destino, id_deposito_destino, nro_lote_destino, cantidad)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            idTraslado,
            id_producto_origen,
            id_deposito_origen,
            id_lote_origen || null,
            id_producto_destino,
            id_deposito_destino,
            nro_lote_destino || null,
            cantidad,
          ]
        );

        // ── 2m. Auditoría───────
        await connection.query(
          `INSERT INTO auditoria
            (entidad, id_entidad, accion, datos_previos, datos_nuevos, usuario_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            "traslado",
            idTraslado,
            "TRASLADO_INVENTARIO",
            JSON.stringify({
              id_producto_origen,
              id_deposito_origen,
              id_lote_origen,
              existencia_origen_antes: invOrigen.existencia_general,
            }),
            JSON.stringify({
              id_producto_destino,
              id_deposito_destino,
              nro_lote_destino,
              cantidad,
              existencia_origen_despues: existFinalOrigen,
              existencia_destino_despues: existFinalDestino,
            }),
            id_usuario,
          ]
        );
      }

      await connection.query("COMMIT");
      return { status: true, code: 201, msg: "Traslado registrado con éxito.", id: idTraslado };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      console.error("Error en createTraslado:", error);
      return { status: false, code: 500, msg: error.message };
    } finally {
      if (connection) connection.release();
    }
  }
}