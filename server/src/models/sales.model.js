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
          v.estado_venta,
          v.estado_pago,

          p.nombre AS paciente,
          u.nombre AS vendedor,
          c.nombre AS clinica,
          s.nombre AS seguro,

          v.subtotal,
          v.impuesto,
          v.total,
          v.abonado,

          (v.total - v.abonado) AS saldo,

          v.fecha_creacion

        FROM ventas v

        LEFT JOIN pacientes p ON p.id = v.id_paciente
        LEFT JOIN usuarios u ON u.id = v.id_vendedor
        LEFT JOIN clinicas c ON c.id = v.id_clinica
        LEFT JOIN seguros s ON s.id = v.id_seguro

        ORDER BY v.fecha_creacion DESC, v.id DESC
      `);

      return {
        status: true,
        code: 200,
        data: result.rows
      };

    } catch (error) {

      return {
        status: false,
        code: 500,
        msg: "Error al obtener ventas",
        error: error.message
      };

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

        /* PACIENTE */
        pa.nombre AS paciente_nombre,

        /* CLINICA */
        cl.nombre AS clinica_nombre,

        /* VENDEDOR */
        ve.nombre AS vendedor_nombre,

        /* OFICINA */
        ofi.nombre AS oficina_nombre,

        /* SEGURO */
        se.nombre AS seguro_nombre,

        /* PRESUPUESTO */
        pre.nro_presupuesto AS nro_presupuesto,

        /* PERSONAL ASIGNADO */
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id_personal', p.id,
                'id_medico', p.id_medico,
                'medico', m.nombre,
                'id_tipo_medico', tm.id,
                'tipo_medico', tm.nombre
              )
            )
            FROM venta_personal vp
            INNER JOIN personal p ON p.id = vp.id_personal
            INNER JOIN medicos m ON m.id = p.id_medico
            LEFT JOIN tipoMedicos tm ON tm.id = m.id_tipoMedico
            WHERE vp.id_venta = v.id
          ),
          '[]'::json
        ) AS personal,

        /* ITEMS DE VENTA */
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(

                'id_detalle', vd.id,
                'id_inventario', vd.id_inventario,
                'id_producto', pr.id,
                'producto', pr.descripcion,
                'sku', i.sku,

                'cantidad', vd.cantidad,
                'precio_venta', vd.precio_venta,
                'descuento1', vd.descuento1,
                'descuento2', vd.descuento2,
                'precio_descuento', vd.precio_descuento,

                /* LOTES DEL DETALLE */
                'lotes',
                COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id_lote', l.id,
                        'nro_lote', l.nro_lote,
                        'id_deposito', l.id_deposito,
                        'deposito', d.nombre,
                        'cantidad', vdl.cantidad,
                        'fecha_caducidad', vdl.fecha_caducidad
                      )
                    )
                    FROM venta_detalle_lote vdl
                    INNER JOIN ventas_detalle vd2 ON vd2.id = vdl.id_detalle
                    INNER JOIN lotes l ON l.id = vdl.id_lote
                    LEFT JOIN depositos d ON d.id = l.id_deposito
                    WHERE vd2.id = vd.id
                  ),
                  '[]'::json
                )

              )
            )
            FROM ventas_detalle vd
            INNER JOIN inventario i ON i.id = vd.id_inventario
            INNER JOIN productos pr ON pr.id = i.id_producto
            WHERE vd.id_venta = v.id
          ),
          '[]'::json
        ) AS items

      FROM ventas v

      LEFT JOIN pacientes pa ON pa.id = v.id_paciente
      LEFT JOIN clinicas cl ON cl.id = v.id_clinica
      LEFT JOIN vendedores ve ON ve.id = v.id_vendedor
      LEFT JOIN oficinas ofi ON ofi.id = v.id_oficina
      LEFT JOIN seguros se ON se.id = v.id_seguro
      LEFT JOIN presupuestos pre ON pre.id = v.id_presupuesto

      WHERE v.id = $1
    `, [id]);

    if (!result.rows.length) {
      return {
        status: false,
        code: 404,
        msg: "Venta no encontrada"
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
      msg: "Error al obtener venta",
      error: error.message
    };

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
        id_clinica,
        id_vendedor,
        id_oficina,
        id_seguro,
        id_presupuesto,
        personal_asignado = [],
        detalle = [],
        subtotal,
        impuesto,
        total,
        abonado,
        notas_abono,
        estado_pago
      } = data;

      /* 1️⃣ GENERAR NUMERO DE FACTURA */

      const lastFactura = await connection.query(`
        SELECT nro_factura
        FROM ventas
        ORDER BY id DESC
        LIMIT 1
      `);

      let correlativo = 1;

      if (lastFactura.rows.length) {

        const last = lastFactura.rows[0].nro_factura; // V000123
        const number = parseInt(last.replace("V", ""), 10);

        correlativo = number + 1;

      }

      const nroFactura = `V${String(correlativo).padStart(6, "0")}`;

      /* 2️⃣ CREAR VENTA */

      const ventaRes = await connection.query(
        `INSERT INTO ventas (
          id_paciente,
          id_clinica,
          id_vendedor,
          id_oficina,
          id_seguro,
          id_presupuesto,
          nro_factura,
          subtotal,
          impuesto,
          total,
          abonado,
          notas_abono,
          estado_pago,
          estado_venta
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'PENDIENTE')
        RETURNING id`,
        [
          id_paciente,
          id_clinica || null,
          id_vendedor ,
          id_oficina || null,
          id_seguro || null,
          id_presupuesto || null,
          nroFactura,
          parseMonto(subtotal),
          parseMonto(impuesto),
          parseMonto(total),
          parseMonto(abonado),
          notas_abono || null,
          estado_pago || "Pendiente"
        ]
      );

      const idVenta = ventaRes.rows[0].id;

      /* 3️⃣ REGISTRAR PERSONAL MEDICO */

      for (const medico of personal_asignado) {

        let idPersonal;

        const personalRes = await connection.query(
          `SELECT id FROM personal WHERE id_medico = $1 LIMIT 1`,
          [medico.id]
        );

        if (personalRes.rows.length) {

          idPersonal = personalRes.rows[0].id;

        } else {

          const newPersonal = await connection.query(
            `INSERT INTO personal (id_medico)
            VALUES ($1)
            RETURNING id`,
            [medico.id]
          );

          idPersonal = newPersonal.rows[0].id;

        }

        await connection.query(
          `INSERT INTO venta_personal (id_venta,id_personal)
          VALUES ($1,$2)`,
          [idVenta, idPersonal]
        );

      }

      /* 4️⃣ DETALLE */

      for (const item of detalle) {

        const detRes = await connection.query(
          `INSERT INTO ventas_detalle (
            id_venta,
            id_inventario,
            cantidad,
            precio_venta,
            descuento1,
            descuento2,
            precio_descuento
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING id`,
          [
            idVenta,
            item.id_inventario,
            parseMonto(item.cantidad),
            parseMonto(item.precio_venta),
            parseMonto(item.descuento1),
            parseMonto(item.descuento2),
            parseMonto(item.precio_descuento)
          ]
        );

        const idDetalle = detRes.rows[0].id;

        /* 5️⃣ LOTES */

        if (item.lotes && Array.isArray(item.lotes)) {

          for (const lote of item.lotes) {

            console.log(lote)

            await connection.query(
              `INSERT INTO venta_detalle_lote (
                id_detalle,
                id_lote,
                cantidad,
                fecha_caducidad
              )
              VALUES ($1,$2,$3,$4)`,
              [
                idDetalle,
                lote.id_lote,
                lote.cantidad,
                lote.fecha_vencimiento
              ]
            );

          }

        }

      }

      await connection.query("COMMIT");

      return {
        status: true,
        code: 201,
        msg: "Venta creada en estado PENDIENTE",
        data: {
          id_venta: idVenta,
          nro_factura: nroFactura
        }
      };

    } catch (error) {

      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error al crear venta",
        error: error.message
      };

    } finally {

      if (connection) connection.release();

    }

  }

  static async editSale(id, data) {

    let connection;

    try {

      connection = await pool.connect();
      await connection.query("BEGIN");

      const {
        id_paciente,
        id_clinica,
        id_vendedor,
        id_oficina,
        id_seguro,
        id_presupuesto,
        personal_asignado = [],
        detalle = [],
        subtotal,
        impuesto,
        total,
        abonado,
        notas_abono,
        estado_pago
      } = data;

      /* 1️⃣ ACTUALIZAR VENTA */

      await connection.query(
        `UPDATE ventas SET
          id_paciente = $1,
          id_clinica = $2,
          id_vendedor = $3,
          id_oficina = $4,
          id_seguro = $5,
          id_presupuesto = $6,
          subtotal = $7,
          impuesto = $8,
          total = $9,
          abonado = $10,
          notas_abono = $11,
          estado_pago = $12
        WHERE id = $13`,
        [
          id_paciente,
          id_clinica || null,
          id_vendedor,
          id_oficina || null,
          id_seguro || null,
          id_presupuesto || null,
          parseMonto(subtotal),
          parseMonto(impuesto),
          parseMonto(total),
          parseMonto(abonado),
          notas_abono || null,
          estado_pago || "Pendiente",
          id
        ]
      );

      /* 2️⃣ LIMPIAR PERSONAL ANTERIOR */

      await connection.query(
        `DELETE FROM venta_personal WHERE id_venta = $1`,
        [id]
      );

      /* 3️⃣ REGISTRAR PERSONAL MEDICO */

      for (const medico of personal_asignado) {

        let idPersonal;

        const personalRes = await connection.query(
          `SELECT id FROM personal WHERE id_medico = $1 LIMIT 1`,
          [medico.id]
        );

        if (personalRes.rows.length) {

          idPersonal = personalRes.rows[0].id;

        } else {

          const newPersonal = await connection.query(
            `INSERT INTO personal (id_medico)
            VALUES ($1)
            RETURNING id`,
            [medico.id]
          );

          idPersonal = newPersonal.rows[0].id;

        }

        await connection.query(
          `INSERT INTO venta_personal (id_venta,id_personal)
          VALUES ($1,$2)`,
          [id, idPersonal]
        );

      }

      /* 4️⃣ ELIMINAR DETALLE ANTERIOR */

      const oldDetalles = await connection.query(
        `SELECT id FROM ventas_detalle WHERE id_venta = $1`,
        [id]
      );

      for (const det of oldDetalles.rows) {

        await connection.query(
          `DELETE FROM venta_detalle_lote WHERE id_detalle = $1`,
          [det.id]
        );

      }

      await connection.query(
        `DELETE FROM ventas_detalle WHERE id_venta = $1`,
        [id]
      );

      /* 5️⃣ INSERTAR NUEVO DETALLE */

      for (const item of detalle) {

        const detRes = await connection.query(
          `INSERT INTO ventas_detalle (
            id_venta,
            id_inventario,
            cantidad,
            precio_venta,
            descuento1,
            descuento2,
            precio_descuento
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING id`,
          [
            id,
            item.id_inventario,
            parseMonto(item.cantidad),
            parseMonto(item.precio_venta),
            parseMonto(item.descuento1),
            parseMonto(item.descuento2),
            parseMonto(item.precio_descuento)
          ]
        );

        const idDetalle = detRes.rows[0].id;

        /* 6️⃣ LOTES */

        if (item.lotes && Array.isArray(item.lotes)) {

          for (const lote of item.lotes) {

            await connection.query(
              `INSERT INTO venta_detalle_lote (
                id_detalle,
                id_lote,
                cantidad,
                fecha_caducidad
              )
              VALUES ($1,$2,$3,$4)`,
              [
                idDetalle,
                lote.id_lote,
                lote.cantidad,
                lote.fecha_vencimiento || lote.fecha_caducidad 
              ]
            );

          }

        }

      }

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Venta actualizada correctamente"
      };

    } catch (error) {

      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error al editar venta",
        error: error.message
      };

    } finally {

      if (connection) connection.release();

    }

  }

  /* ================= CONFIRMAR VENTA ================= */

  static async confirmSale(idVenta) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      /* 1️⃣ VALIDAR VENTA */
      const ventaQuery = await connection.query(
        `SELECT * FROM ventas WHERE id = $1 FOR UPDATE`,
        [idVenta]
      );

      if (!ventaQuery.rows.length) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "La venta solicitada no existe." };
      }

      const venta = ventaQuery.rows[0];

      if (venta.estado_venta !== "PENDIENTE") {
        await connection.query("ROLLBACK");
        return { status: false, code: 400, msg: "Esta venta ya fue confirmada o procesada previamente." };
      }

      /* 2️⃣ OBTENER DETALLE */
      const detalles = await connection.query(
        `SELECT * FROM ventas_detalle WHERE id_venta = $1`,
        [idVenta]
      );

      if (!detalles.rows.length) {
        await connection.query("ROLLBACK");
        return { status: false, code: 400, msg: "La venta no tiene productos asignados." };
      }

      /* 3️⃣ VALIDAR LOTES (Con nombre de producto y nro de lote) */
      const lotes = await connection.query(`
        SELECT 
          vdl.cantidad AS cantidad_pedida,
          l.id AS id_lote,
          l.nro_lote,
          l.cantidad AS stock_actual_lote,
          l.id_producto,
          l.id_deposito,
          p.descripcion AS nombre_producto
        FROM venta_detalle_lote vdl
        INNER JOIN ventas_detalle vd ON vd.id = vdl.id_detalle
        INNER JOIN lotes l ON l.id = vdl.id_lote
        INNER JOIN productos p ON p.id = l.id_producto
        WHERE vd.id_venta = $1
        FOR UPDATE
      `, [idVenta]);

      for (const lote of lotes.rows) {
        if (lote.stock_actual_lote < lote.cantidad_pedida) {
          await connection.query("ROLLBACK");
          return { 
            status: false, 
            code: 400, 
            msg: `Stock insuficiente en Lote: ${lote.nro_lote} para el producto ${lote.nombre_producto}. (Disponible: ${lote.stock_actual_lote}, Requerido: ${lote.cantidad_pedida})` 
          };
        }
      }

      /* 4️⃣ VALIDAR INVENTARIO GENERAL (Con nombre de producto) */
      for (const item of detalles.rows) {
        const invQuery = await connection.query(`
          SELECT i.*, p.descripcion AS nombre_producto 
          FROM inventario i
          INNER JOIN productos p ON p.id = i.id_producto
          WHERE i.id = $1 FOR UPDATE`,
          [item.id_inventario]
        );

        if (!invQuery.rows.length) {
          await connection.query("ROLLBACK");
          return { status: false, code: 404, msg: "No se encontró el registro de inventario para uno de los productos." };
        }

        const inv = invQuery.rows[0];

        if (inv.existencia_general < item.cantidad) {
          await connection.query("ROLLBACK");
          return { 
            status: false, 
            code: 400, 
            msg: `Stock general insuficiente para: ${inv.nombre_producto}. (Disponible: ${inv.existencia_general})` 
          };
        }
      }

      /* 5️⃣ DESCONTAR INVENTARIO + KARDEX GENERAL */
      for (const item of detalles.rows) {
        const invQuery = await connection.query(
          `SELECT * FROM inventario WHERE id = $1`, [item.id_inventario]
        );
        const inv = invQuery.rows[0];
        const nuevoStock = inv.existencia_general - item.cantidad;

        await connection.query(
          `UPDATE inventario SET existencia_general = $1 WHERE id = $2`,
          [nuevoStock, inv.id]
        );

        await connection.query(
          `INSERT INTO kardexg (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
          VALUES ($1, NOW(), $2, 0, $3, $4, $5, $6, $7, $8, 'VENTA')`,
          [inv.id_producto, inv.existencia_general, item.cantidad, nuevoStock, inv.costo_unitario, inv.precio_venta, `Venta Factura: ${venta.nro_factura}`, venta.nro_factura]
        );
      }

      /* 6️⃣ DESCONTAR LOTES + DEPÓSITO + KARDEX DEPÓSITO */
      for (const lote of lotes.rows) {
        // Descontar del lote
        await connection.query(
          `UPDATE lotes SET cantidad = cantidad - $1 WHERE id = $2`,
          [lote.cantidad_pedida, lote.id_lote]
        );

        // Descontar de edeposito (Stock por almacén)
        const depQuery = await connection.query(
          `SELECT existencia_deposito FROM edeposito WHERE id_producto=$1 AND id_deposito=$2 FOR UPDATE`,
          [lote.id_producto, lote.id_deposito]
        );

        if (depQuery.rows.length > 0) {
          const existenciaInicial = depQuery.rows[0].existencia_deposito;
          const existenciaFinal = existenciaInicial - lote.cantidad_pedida;

          await connection.query(
            `UPDATE edeposito SET existencia_deposito = $1 WHERE id_producto=$2 AND id_deposito=$3`,
            [existenciaFinal, lote.id_producto, lote.id_deposito]
          );

          // Kardex Almacén
          await connection.query(
            `INSERT INTO kardexdep (id_producto, id_deposito, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
            VALUES ($1, $2, NOW(), $3, 0, $4, $5, 0, 0, $6, $7, 'VENTA')`,
            [lote.id_producto, lote.id_deposito, existenciaInicial, lote.cantidad_pedida, existenciaFinal, `Venta Factura: ${venta.nro_factura}`, venta.nro_factura]
          );
        }
      }

      /* 7️⃣ FINALIZAR VENTA */
      await connection.query(
        `UPDATE ventas SET estado_venta = 'CONFIRMADA' WHERE id = $1`,
        [idVenta]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Venta confirmada exitosamente. Inventario y Kardex actualizados."
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      console.error("Error en confirmSale:", error);
      return {
        status: false,
        code: 500,
        msg: "Error interno procesando la transacción.",
        error: error.message
      };
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

      /* 1️⃣ Verificar venta */

      const sale = await connection.query(
        `SELECT id FROM ventas WHERE id = $1`,
        [id]
      );

      if (!sale.rowCount) {

        await connection.query("ROLLBACK");

        return {
          status: false,
          code: 404,
          msg: "Venta no encontrada"
        };

      }

      /* 2️⃣ Eliminar lotes */

      await connection.query(`
        DELETE FROM venta_detalle_lote
        WHERE id_detalle IN (
          SELECT id FROM ventas_detalle WHERE id_venta = $1
        )
      `, [id]);

      /* 3️⃣ Eliminar detalle */

      await connection.query(
        `DELETE FROM ventas_detalle WHERE id_venta = $1`,
        [id]
      );

      /* 4️⃣ Eliminar personal asignado */

      await connection.query(
        `DELETE FROM venta_personal WHERE id_venta = $1`,
        [id]
      );

      /* 5️⃣ Eliminar venta */

      await connection.query(
        `DELETE FROM ventas WHERE id = $1`,
        [id]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Venta eliminada correctamente"
      };

    } catch (error) {

      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error al eliminar venta",
        error: error.message
      };

    } finally {

      if (connection) connection.release();

    }

  }

}