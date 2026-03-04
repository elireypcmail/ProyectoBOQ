// models/sales.model.js
import pool from "../connection/db.connect.js";

const parseMonto = (valor) => {
  if (!valor) return 0;
  if (typeof valor === "number") return valor;
  return parseFloat(valor.toString().replace(/\./g, "").replace(",", "."));
};

export class SalesModel {

  /* ================= LISTADO ================= */

  static async getAllSales() {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT 
          v.id,
          v.nro_factura,
          v.total,
          v.abonado,
          v.estado_pago,
          p.nombre AS paciente,
          v.fecha_creacion
        FROM ventas v
        INNER JOIN pacientes p ON v.id_paciente = p.id
        ORDER BY v.fecha_creacion DESC, v.id DESC
      `);

      return {
        status: true,
        code: 200,
        data: result.rows
      };

    } catch (error) {
      return { status: false, code: 500, msg: "Error al obtener ventas", error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= DETALLE ================= */

  static async getSaleById(id) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT 
          v.*,
          COALESCE((
            SELECT json_agg(
              json_build_object(
                'id_inventario', vd.id_inventario,
                'cantidad', vd.cantidad,
                'precio_venta', vd.precio_venta,
                'descuento1', vd.descuento1,
                'descuento2', vd.descuento2,
                'precio_descuento', vd.precio_descuento
              )
            )
            FROM ventas_detalle vd
            WHERE vd.id_venta = v.id
          ), '[]') AS items
        FROM ventas v
        WHERE v.id = $1
      `, [id]);

      if (!result.rows.length)
        return { status: false, code: 404, msg: "Venta no encontrada" };

      return { status: true, code: 200, data: result.rows[0] };

    } catch (error) {
      return { status: false, code: 500, msg: "Error al obtener venta", error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= CREAR VENTA ================= */

  static async createSale(data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const {
        id_paciente,
        id_personal,
        id_vendedor,
        id_oficina,
        id_seguro,
        id_presupuesto,
        nro_factura,
        items,
        totales
      } = data;

      const subtotal = parseMonto(totales?.subtotal);
      const impuesto = parseMonto(totales?.impuesto);
      const total = parseMonto(totales?.total);
      const abonado = parseMonto(totales?.abonado);

      /* 1️⃣ Insertar Cabecera */
      const ventaRes = await connection.query(
        `INSERT INTO ventas (
          id_paciente, id_personal, id_vendedor, id_oficina,
          id_seguro, id_presupuesto,
          nro_factura, subtotal, impuesto, total, abonado, estado_pago
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING id`,
        [
          id_paciente,
          id_personal,
          id_vendedor,
          id_oficina,
          id_seguro,
          id_presupuesto,
          nro_factura,
          subtotal,
          impuesto,
          total,
          abonado,
          "PENDIENTE"
        ]
      );

      const idVenta = ventaRes.rows[0].id;

      /* 2️⃣ Procesar Items */
      for (const item of items) {

        const cantidad = parseMonto(item.cantidad);

        const invQuery = await connection.query(
          `SELECT * FROM inventario WHERE id = $1`,
          [item.id_inventario]
        );

        if (!invQuery.rows.length)
          throw new Error(`Inventario ${item.id_inventario} no existe`);

        const inv = invQuery.rows[0];

        if (inv.existencia_general < cantidad)
          throw new Error(`Stock insuficiente para producto ${inv.id_producto}`);

        const nuevoStock = inv.existencia_general - cantidad;

        /* 3️⃣ Descontar Inventario */
        await connection.query(
          `UPDATE inventario
           SET existencia_general = $1
           WHERE id = $2`,
          [nuevoStock, inv.id]
        );

        /* 4️⃣ Kardex (SALIDA) */
        await connection.query(
          `INSERT INTO kardexg (
            id_producto, fecha,
            existencia_inicial, entrada, salida,
            existencia_final, costo, precio,
            detalle, documento, tipo
          )
          VALUES ($1,NOW(),$2,0,$3,$4,$5,$6,$7,$8,'VENTA')`,
          [
            inv.id_producto,
            inv.existencia_general,
            cantidad,
            nuevoStock,
            inv.costo_unitario,
            inv.precio_venta,
            `Venta Fac: ${nro_factura}`,
            nro_factura
          ]
        );

        /* 5️⃣ Insertar Detalle */
        const detRes = await connection.query(
          `INSERT INTO ventas_detalle (
            id_venta, id_inventario, cantidad,
            precio_venta, descuento1, descuento2,
            precio_descuento
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING id`,
          [
            idVenta,
            inv.id,
            cantidad,
            parseMonto(item.precio_venta),
            parseMonto(item.descuento1),
            parseMonto(item.descuento2),
            parseMonto(item.precio_descuento)
          ]
        );

        const idDetalle = detRes.rows[0].id;

        /* 6️⃣ Manejo de Lotes (si aplica) */
        if (item.lotes && Array.isArray(item.lotes)) {
          for (const lote of item.lotes) {

            const loteRes = await connection.query(
              `SELECT * FROM lotes WHERE id = $1`,
              [lote.id_lote]
            );

            if (!loteRes.rows.length)
              throw new Error("Lote no encontrado");

            const loteDB = loteRes.rows[0];

            if (loteDB.cantidad < lote.cantidad)
              throw new Error("Stock insuficiente en lote");

            await connection.query(
              `UPDATE lotes SET cantidad = cantidad - $1 WHERE id = $2`,
              [lote.cantidad, lote.id_lote]
            );

            await connection.query(
              `INSERT INTO venta_detalle_lote (
                id_detalle, id_lote, cantidad, fecha_caducidad
              ) VALUES ($1,$2,$3,$4)`,
              [
                idDetalle,
                lote.id_lote,
                lote.cantidad,
                lote.fecha_caducidad
              ]
            );
          }
        }
      }

      await connection.query("COMMIT");

      return { status: true, code: 201, msg: "Venta registrada con éxito" };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return { status: false, code: 500, msg: "Error al registrar venta", error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= ELIMINAR ================= */

  static async deleteSale(id) {
    let connection;
    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const result = await connection.query(
        `DELETE FROM ventas WHERE id=$1 RETURNING id`,
        [id]
      );

      if (!result.rowCount) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "Venta no encontrada" };
      }

      await connection.query("COMMIT");

      return { status: true, code: 200, msg: "Venta eliminada correctamente" };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return { status: false, code: 500, msg: "Error al eliminar venta", error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

}