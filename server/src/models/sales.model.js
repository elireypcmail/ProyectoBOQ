// models/sales.model.js
import pool from "../connection/db.connect.js";
import { sendSurgeryNotification } from "../utils/emails.js";

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
          v.estatus,
          v.estado_pago,
          
          -- Datos relacionados
          p.nombre AS paciente,
          vend.nombre AS vendedor,
          c.nombre AS clinica,
          s.nombre AS seguro,
          
          -- Montos ajustados a la nueva estructura
          v.subtotal1,
          v.descuento,
          v.subtotal2,
          v.impuesto,
          v.total,
          v.abonado,
          (v.total - v.abonado) AS saldo,
          
          v.fecha_creacion
        FROM ventas v
        LEFT JOIN pacientes p ON p.id = v.id_paciente
        LEFT JOIN vendedores vend ON vend.id = v.id_vendedor
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
          v.id,
          v.nro_factura,
          v.estado_venta,
          v.estado_pago,
          v.estatus,
          v.notas_abono,

          v.id_paciente,
          v.id_clinica,
          v.id_vendedor,
          v.id_oficina,
          v.id_seguro,
          v.id_presupuesto,
          v.id_deposito,

          v.subtotal1,
          v.descuentoPor,
          v.descuento,
          v.subtotal2,
          v.impuesto,
          v.total,
          v.abonado,
          v.fecha_creacion,

          pa.nombre AS paciente_nombre,
          cl.nombre AS clinica_nombre,
          ve.nombre AS vendedor_nombre,
          ofi.nombre AS oficina_nombre,
          se.nombre AS seguro_nombre,
          pre.nro_presupuesto,
          d.nombre AS deposito_nombre,

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
                  'id', i.id_producto,
                  'sku', i.sku,
                  'producto', vd.descripcion,
                  'cantidad', vd.cantidad,
                  'precio_venta', vd.precio_venta,
                  'descuento1', vd.descuento1,
                  'descuento_por1', vd.descuento_por1,
                  'descuento2', vd.descuento2,
                  'descuento_por2', vd.descuento_por2,
                  'precio_unitario_final', vd.precio_unitario_final,

                  'lotes',
                  COALESCE(
                    (
                      SELECT json_agg(
                        json_build_object(
                          'id_lote', l.id,
                          'nro_lote', l.nro_lote,
                          'id_deposito', l.id_deposito,
                          'deposito_nombre', dp.nombre,
                          'cantidad', vdl.cantidad,
                          'fecha_vencimiento', vdl.fecha_caducidad
                        )
                      )
                      FROM venta_detalle_lote vdl
                      INNER JOIN lotes l ON l.id = vdl.id_lote
                      LEFT JOIN depositos dp ON dp.id = l.id_deposito
                      WHERE vdl.id_detalle = vd.id
                    ),
                    '[]'::json
                  )
                )
              )
              FROM ventas_detalle vd
              INNER JOIN inventario i ON i.id = vd.id_inventario
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
        LEFT JOIN depositos d ON d.id = v.id_deposito

        WHERE v.id = $1
      `, [id]);

      if (!result.rows.length) {
        return { status: false, code: 404, msg: "Venta no encontrada" };
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

  // static async createSale(data) {
  //   let connection;

  //   try {
  //     connection = await pool.connect();
  //     await connection.query("BEGIN");

  //     const {
  //       id_paciente,
  //       id_clinica,
  //       id_vendedor,
  //       id_oficina,
  //       id_seguro,
  //       id_presupuesto,
  //       id_deposito, // 👈 NUEVO
  //       personal_asignado = [],
  //       detalle = [],
  //       subtotal,
  //       descuento,
  //       impuesto,
  //       total,
  //       abonado,
  //       notas_abono,
  //       estado_pago
  //     } = data;

  //     /* CALCULOS */
  //     const subtotal1 = parseMonto(subtotal);
  //     const m_descuento = parseMonto(descuento);
  //     const subtotal2 = subtotal1 - m_descuento;
  //     const descPorcentaje = subtotal1 > 0 ? (m_descuento / subtotal1) * 100 : 0;

  //     /* 1️⃣ GENERAR NUMERO DE FACTURA */
  //     const lastFactura = await connection.query(`
  //       SELECT nro_factura FROM ventas ORDER BY id DESC LIMIT 1
  //     `);

  //     let correlativo = 1;

  //     if (lastFactura.rows.length) {
  //       const last = lastFactura.rows[0].nro_factura;
  //       const number = parseInt(last.replace("V", ""), 10);
  //       correlativo = number + 1;
  //     }

  //     const nroFactura = `V${String(correlativo).padStart(6, "0")}`;

  //     /* 2️⃣ CREAR VENTA */
  //     const ventaRes = await connection.query(
  //       `INSERT INTO ventas (
  //         id_paciente,
  //         id_clinica,
  //         id_vendedor,
  //         id_oficina,
  //         id_seguro,
  //         id_presupuesto,
  //         id_deposito,
  //         nro_factura,
  //         subtotal1,
  //         descuentoPor,
  //         descuento,
  //         subtotal2,
  //         impuesto,
  //         total,
  //         abonado,
  //         notas_abono,
  //         estado_pago,
  //         estado_venta
  //       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'PENDIENTE')
  //       RETURNING id`,
  //       [
  //         id_paciente,
  //         id_clinica || null,
  //         id_vendedor,
  //         id_oficina || null,
  //         id_seguro || null,
  //         id_presupuesto || null,
  //         id_deposito || null, // 👈 NUEVO
  //         nroFactura,
  //         subtotal1,
  //         descPorcentaje,
  //         m_descuento,
  //         subtotal2,
  //         parseMonto(impuesto),
  //         parseMonto(total),
  //         parseMonto(abonado),
  //         notas_abono || null,
  //         estado_pago || "Pendiente"
  //       ]
  //     );

  //     const idVenta = ventaRes.rows[0].id;

  //     /* 3️⃣ PERSONAL MEDICO */
  //     for (const medico of personal_asignado) {

  //       let personalRes = await connection.query(
  //         `SELECT id FROM personal WHERE id_medico = $1 LIMIT 1`,
  //         [medico.id]
  //       );

  //       let idPersonal;

  //       if (personalRes.rows.length) {
  //         idPersonal = personalRes.rows[0].id;
  //       } else {
  //         const newPersonal = await connection.query(
  //           `INSERT INTO personal (id_medico) VALUES ($1) RETURNING id`,
  //           [medico.id]
  //         );
  //         idPersonal = newPersonal.rows[0].id;
  //       }

  //       await connection.query(
  //         `INSERT INTO venta_personal (id_venta, id_personal)
  //         VALUES ($1,$2)`,
  //         [idVenta, idPersonal]
  //       );
  //     }

  //     /* 4️⃣ DETALLE */
  //     for (const item of detalle) {

  //       const detRes = await connection.query(
  //         `INSERT INTO ventas_detalle (
  //           id_venta,
  //           id_inventario,
  //           descripcion,
  //           cantidad,
  //           precio_venta,
  //           descuento1,
  //           descuento_unitario,
  //           precio_unitario_final
  //         )
  //         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
  //         RETURNING id`,
  //         [
  //           idVenta,
  //           item.id_inventario,
  //           item.descripcion || "Producto",
  //           parseMonto(item.cantidad),
  //           parseMonto(item.precio_venta),
  //           parseMonto(item.descuento1),
  //           parseMonto(item.descuento_unitario),
  //           parseMonto(item.precio_descuento)
  //         ]
  //       );

  //       const idDetalle = detRes.rows[0].id;

  //       /* 5️⃣ LOTES */
  //       if (item.lotes && Array.isArray(item.lotes)) {

  //         for (const lote of item.lotes) {

  //           await connection.query(
  //             `INSERT INTO venta_detalle_lote
  //             (id_detalle, id_lote, cantidad, fecha_caducidad)
  //             VALUES ($1,$2,$3,$4)`,
  //             [
  //               idDetalle,
  //               lote.id_lote,
  //               parseMonto(lote.cantidad),
  //               lote.fecha_vencimiento
  //             ]
  //           );
  //         }

  //       }

  //     }

  //     await connection.query("COMMIT");

  //     return {
  //       status: true,
  //       code: 201,
  //       msg: "Venta creada",
  //       data: {
  //         id_venta: idVenta,
  //         nro_factura: nroFactura
  //       }
  //     };

  //   } catch (error) {

  //     if (connection) await connection.query("ROLLBACK");

  //     return {
  //       status: false,
  //       code: 500,
  //       msg: "Error al crear venta",
  //       error: error.message
  //     };

  //   } finally {

  //     if (connection) connection.release();

  //   }
  // }

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
        id_deposito,
        personal_asignado = [],
        detalle = [],
        subtotal,
        descuento,
        impuesto,
        total,
        abonado,
        notas_abono,
        estado_pago
      } = data;

      /* CALCULOS */
      const subtotal1 = parseMonto(subtotal);
      const m_descuento = parseMonto(descuento);
      const subtotal2 = subtotal1 - m_descuento;
      const descPorcentaje = subtotal1 > 0 ? (m_descuento / subtotal1) * 100 : 0;

      /* 0️⃣ OBTENER NOMBRE DEL PACIENTE (PARA EL CORREO) */
      const patientQuery = await connection.query(
        `SELECT nombre FROM pacientes WHERE id = $1 LIMIT 1`,
        [id_paciente]
      );
      const nombrePaciente = patientQuery.rows.length ? patientQuery.rows[0].nombre : "Paciente";

      /* 1️⃣ GENERAR NUMERO DE FACTURA */
      const lastFactura = await connection.query(`
        SELECT nro_factura FROM ventas ORDER BY id DESC LIMIT 1
      `);

      let correlativo = 1;

      if (lastFactura.rows.length) {
        const last = lastFactura.rows[0].nro_factura;
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
          id_deposito,
          nro_factura,
          subtotal1,
          descuentoPor,
          descuento,
          subtotal2,
          impuesto,
          total,
          abonado,
          notas_abono,
          estado_pago,
          estado_venta
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'PENDIENTE')
        RETURNING id`,
        [
          id_paciente,
          id_clinica || null,
          id_vendedor,
          id_oficina || null,
          id_seguro || null,
          id_presupuesto || null,
          id_deposito || null,
          nroFactura,
          subtotal1,
          descPorcentaje,
          m_descuento,
          subtotal2,
          parseMonto(impuesto),
          parseMonto(total),
          parseMonto(abonado),
          notas_abono || null,
          estado_pago || "Pendiente"
        ]
      );

      const idVenta = ventaRes.rows[0].id;

      /* 3️⃣ PERSONAL MEDICO */
      for (const medico of personal_asignado) {
        let personalRes = await connection.query(
          `SELECT id FROM personal WHERE id_medico = $1 LIMIT 1`,
          [medico.id]
        );

        let idPersonal;

        if (personalRes.rows.length) {
          idPersonal = personalRes.rows[0].id;
        } else {
          const newPersonal = await connection.query(
            `INSERT INTO personal (id_medico) VALUES ($1) RETURNING id`,
            [medico.id]
          );
          idPersonal = newPersonal.rows[0].id;
        }

        await connection.query(
          `INSERT INTO venta_personal (id_venta, id_personal)
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
            descripcion,
            cantidad,
            precio_venta,
            descuento1,
            descuento_unitario,
            precio_unitario_final
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING id`,
          [
            idVenta,
            item.id_inventario,
            item.descripcion || "Producto",
            parseMonto(item.cantidad),
            parseMonto(item.precio_venta),
            parseMonto(item.descuento1),
            parseMonto(item.descuento_unitario),
            parseMonto(item.precio_descuento)
          ]
        );

        const idDetalle = detRes.rows[0].id;

        /* 5️⃣ LOTES */
        if (item.lotes && Array.isArray(item.lotes)) {
          for (const lote of item.lotes) {
            await connection.query(
              `INSERT INTO venta_detalle_lote
              (id_detalle, id_lote, cantidad, fecha_caducidad)
              VALUES ($1,$2,$3,$4)`,
              [
                idDetalle,
                lote.id_lote,
                parseMonto(lote.cantidad),
                lote.fecha_vencimiento
              ]
            );
          }
        }
      }

      /* 6️⃣ OBTENER MÉDICOS PARA NOTIFICACIÓN */
      const personalQuery = await connection.query(
        `SELECT m.email 
         FROM venta_personal vp
         INNER JOIN personal p ON vp.id_personal = p.id
         INNER JOIN medicos m ON p.id_medico = m.id
         WHERE vp.id_venta = $1 
         AND m.notificaciones = TRUE 
         AND m.email IS NOT NULL AND m.email != ''`,
        [idVenta]
      );

      const medicosANotificar = personalQuery.rows;

      await connection.query("COMMIT");

      /* 7️⃣ ENVIAR CORREOS DESPUÉS DEL COMMIT */
      if (medicosANotificar.length > 0) {
        medicosANotificar.forEach(medico => {
          sendSurgeryNotification(medico.email, nombrePaciente);
        });
      }

      return {
        status: true,
        code: 201,
        msg: "Venta creada y notificaciones enviadas",
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
        id_deposito, // 👈 NUEVO
        personal_asignado = [],
        detalle = [],
        subtotal,
        descuento,
        impuesto,
        total,
        abonado,
        notas_abono,
        estado_pago
      } = data;

      /* CALCULOS */
      const subtotal1 = parseMonto(subtotal);
      const m_descuento = parseMonto(descuento);
      const subtotal2 = subtotal1 - m_descuento;
      const descPorcentaje = subtotal1 > 0 ? (m_descuento / subtotal1) * 100 : 0;

      /* 1️⃣ ACTUALIZAR CABECERA DE VENTA */
      await connection.query(
        `UPDATE ventas SET
          id_paciente = $1,
          id_clinica = $2,
          id_vendedor = $3,
          id_oficina = $4,
          id_seguro = $5,
          id_presupuesto = $6,
          id_deposito = $7,
          subtotal1 = $8,
          descuentoPor = $9,
          descuento = $10,
          subtotal2 = $11,
          impuesto = $12,
          total = $13,
          abonado = $14,
          notas_abono = $15,
          estado_pago = $16
        WHERE id = $17`,
        [
          id_paciente,
          id_clinica || null,
          id_vendedor,
          id_oficina || null,
          id_seguro || null,
          id_presupuesto || null,
          id_deposito || null, // 👈 NUEVO
          subtotal1,
          descPorcentaje,
          m_descuento,
          subtotal2,
          parseMonto(impuesto),
          parseMonto(total),
          parseMonto(abonado),
          notas_abono || null,
          estado_pago || "Pendiente",
          id
        ]
      );

      /* 2️⃣ LIMPIAR PERSONAL Y DETALLE ANTERIOR */
      await connection.query(`DELETE FROM venta_personal WHERE id_venta = $1`, [id]);

      // venta_detalle_lote se borra automáticamente por CASCADE
      await connection.query(`DELETE FROM ventas_detalle WHERE id_venta = $1`, [id]);

      /* 3️⃣ REGISTRAR PERSONAL */
      for (const medico of personal_asignado) {
        let personalRes = await connection.query(
          `SELECT id FROM personal WHERE id_medico = $1 LIMIT 1`,
          [medico.id]
        );

        let idPersonal;

        if (personalRes.rows.length) {
          idPersonal = personalRes.rows[0].id;
        } else {
          const newPersonal = await connection.query(
            `INSERT INTO personal (id_medico) VALUES ($1) RETURNING id`,
            [medico.id]
          );
          idPersonal = newPersonal.rows[0].id;
        }

        await connection.query(
          `INSERT INTO venta_personal (id_venta, id_personal)
          VALUES ($1,$2)`,
          [id, idPersonal]
        );
      }

      /* 4️⃣ INSERTAR DETALLE */
      for (const item of detalle) {
        const detRes = await connection.query(
          `INSERT INTO ventas_detalle (
            id_venta,
            id_inventario,
            descripcion,
            cantidad,
            precio_venta,
            descuento1,
            descuento_unitario,
            precio_unitario_final
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING id`,
          [
            id,
            item.id_inventario,
            item.descripcion || "Producto",
            parseMonto(item.cantidad),
            parseMonto(item.precio_venta),
            parseMonto(item.descuento1),
            parseMonto(item.descuento_unitario),
            parseMonto(item.precio_descuento)
          ]
        );

        const idDetalle = detRes.rows[0].id;

        /* 5️⃣ LOTES */
        if (item.lotes && Array.isArray(item.lotes)) {
          for (const lote of item.lotes) {
            console.log(lote)

            await connection.query(
              `INSERT INTO venta_detalle_lote
              (id_detalle, id_lote, cantidad, fecha_caducidad)
              VALUES ($1,$2,$3,$4)`,
              [
                idDetalle,
                lote.id_lote,
                parseMonto(lote.cantidad),
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

      if (!ventaQuery.rows.length) throw new Error("La venta no existe.");
      const venta = ventaQuery.rows[0];

      if (venta.estado_venta !== "PENDIENTE") {
        throw new Error("Esta venta ya fue procesada.");
      }

      /* 2️⃣ OBTENER DETALLE */
      const detalles = await connection.query(
        `SELECT * FROM ventas_detalle WHERE id_venta = $1`,
        [idVenta]
      );

      if (!detalles.rows.length) throw new Error("La venta no tiene productos.");

      /* 3️⃣ VALIDAR STOCK DE LOTES (SOLO SI EXISTEN) */
      const lotesQuery = await connection.query(
        `SELECT vdl.cantidad AS cantidad_pedida, l.id AS id_lote, l.nro_lote,
                l.cantidad AS stock_actual_lote, l.id_producto, l.id_deposito,
                p.descripcion AS nombre_producto
        FROM venta_detalle_lote vdl
        INNER JOIN ventas_detalle vd ON vd.id = vdl.id_detalle
        INNER JOIN lotes l ON l.id = vdl.id_lote
        INNER JOIN productos p ON p.id = l.id_producto
        WHERE vd.id_venta = $1 FOR UPDATE`,
        [idVenta]
      );

      for (const lote of lotesQuery.rows) {
        if (Number(lote.stock_actual_lote) < Number(lote.cantidad_pedida)) {
          throw new Error(`Stock insuficiente en Lote: ${lote.nro_lote} (${lote.nombre_producto})`);
        }
      }

      /* 4️⃣ DESCUENTO GENERAL (PARA TODOS LOS PRODUCTOS) */
      for (const item of detalles.rows) {
        const cantidad = Number(item.cantidad);

        const invQuery = await connection.query(
          `SELECT * FROM inventario WHERE id = $1 FOR UPDATE`,
          [item.id_inventario]
        );

        if (!invQuery.rows.length) throw new Error("Producto no en inventario.");

        const inv = invQuery.rows[0];
        const existenciaInicial = Number(inv.existencia_general);
        
        if (existenciaInicial < cantidad) {
          throw new Error(`Stock global insuficiente para: ${item.descripcion}`);
        }

        const nuevoStock = existenciaInicial - cantidad;

        // Actualizar Inventario General
        await connection.query(
          `UPDATE inventario SET existencia_general = $1 WHERE id = $2`,
          [nuevoStock, inv.id]
        );

        // Kardex General (Siempre se dispara)
        await connection.query(
          `INSERT INTO kardexg
          (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
          VALUES ($1, NOW(), $2, 0, $3, $4, $5, $6, $7, $8, 'VENTA')`,
          [inv.id_producto, existenciaInicial, cantidad, nuevoStock, Number(inv.costo_unitario), Number(item.precio_unitario_final), `Venta Fac: ${venta.nro_factura}`, venta.nro_factura]
        );
        
        // NOTA: Aquí ya no hay lógica de edeposito para productos sin lotes.
      }

      /* 5️⃣ DESCUENTO ESPECÍFICO DE LOTES Y DEPÓSITOS (SOLO PARA PRODUCTOS CON LOTES) */
      for (const lote of lotesQuery.rows) {
        const cantidad = Number(lote.cantidad_pedida);

        // Descontar del lote
        await connection.query(
          `UPDATE lotes SET cantidad = cantidad - $1 WHERE id = $2`,
          [cantidad, lote.id_lote]
        );

        // Como este producto SÍ tiene lote, entonces SÍ tiene depósito asociado
        const depQuery = await connection.query(
          `SELECT existencia_deposito FROM edeposito
          WHERE id_producto = $1 AND id_deposito = $2 FOR UPDATE`,
          [lote.id_producto, lote.id_deposito]
        );

        if (depQuery.rows.length > 0) {
          const exInicialDep = Number(depQuery.rows[0].existencia_deposito);
          const exFinalDep = exInicialDep - cantidad;

          await connection.query(
            `UPDATE edeposito SET existencia_deposito = $1
            WHERE id_producto = $2 AND id_deposito = $3`,
            [exFinalDep, lote.id_producto, lote.id_deposito]
          );

          // Kardex por depósito (Solo para productos con lote)
          await connection.query(
            `INSERT INTO kardexdep
            (id_producto, id_deposito, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
            VALUES ($1, $2, NOW(), $3, 0, $4, $5, 0, 0, $6, $7, 'VENTA')`,
            [lote.id_producto, lote.id_deposito, exInicialDep, cantidad, exFinalDep, `Venta Lote: ${lote.nro_lote}`, venta.nro_factura]
          );
        }
      }

      /* 6️⃣ FINALIZAR */
      await connection.query(`UPDATE ventas SET estado_venta = 'CONFIRMADA' WHERE id = $1`, [idVenta]);

      await connection.query("COMMIT");
      return { status: true, code: 200, msg: "Venta confirmada." };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return { status: false, code: 500, msg: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // static async confirmSale(idVenta) {
  //   let connection;

  //   try {
  //     connection = await pool.connect();
  //     await connection.query("BEGIN");

  //     /* 1️⃣ VALIDAR VENTA Y OBTENER DATOS DEL PACIENTE */
  //     const ventaQuery = await connection.query(
  //       `SELECT v.*, p.nombre AS nombre_paciente 
  //        FROM ventas v 
  //        INNER JOIN pacientes p ON v.id_paciente = p.id
  //        WHERE v.id = $1 FOR UPDATE`,
  //       [idVenta]
  //     );

  //     if (!ventaQuery.rows.length) throw new Error("La venta no existe.");
  //     const venta = ventaQuery.rows[0];

  //     if (venta.estado_venta !== "PENDIENTE") {
  //       throw new Error("Esta venta ya fue procesada.");
  //     }

  //     /* 2️⃣ OBTENER DETALLE */
  //     const detalles = await connection.query(
  //       `SELECT * FROM ventas_detalle WHERE id_venta = $1`,
  //       [idVenta]
  //     );

  //     if (!detalles.rows.length) throw new Error("La venta no tiene productos.");

  //     /* 3️⃣ VALIDAR STOCK DE LOTES */
  //     const lotesQuery = await connection.query(
  //       `SELECT vdl.cantidad AS cantidad_pedida, l.id AS id_lote, l.nro_lote,
  //               l.cantidad AS stock_actual_lote, l.id_producto, l.id_deposito,
  //               p.descripcion AS nombre_producto
  //       FROM venta_detalle_lote vdl
  //       INNER JOIN ventas_detalle vd ON vd.id = vdl.id_detalle
  //       INNER JOIN lotes l ON l.id = vdl.id_lote
  //       INNER JOIN productos p ON p.id = l.id_producto
  //       WHERE vd.id_venta = $1 FOR UPDATE`,
  //       [idVenta]
  //     );

  //     for (const lote of lotesQuery.rows) {
  //       if (Number(lote.stock_actual_lote) < Number(lote.cantidad_pedida)) {
  //         throw new Error(`Stock insuficiente en Lote: ${lote.nro_lote} (${lote.nombre_producto})`);
  //       }
  //     }

  //     /* 4️⃣ DESCUENTO GENERAL E INVENTARIO */
  //     for (const item of detalles.rows) {
  //       const cantidad = Number(item.cantidad);
  //       const invQuery = await connection.query(
  //         `SELECT * FROM inventario WHERE id = $1 FOR UPDATE`,
  //         [item.id_inventario]
  //       );

  //       if (!invQuery.rows.length) throw new Error("Producto no en inventario.");

  //       const inv = invQuery.rows[0];
  //       const existenciaInicial = Number(inv.existencia_general);
        
  //       if (existenciaInicial < cantidad) {
  //         throw new Error(`Stock global insuficiente para: ${item.descripcion}`);
  //       }

  //       const nuevoStock = existenciaInicial - cantidad;

  //       await connection.query(
  //         `UPDATE inventario SET existencia_general = $1 WHERE id = $2`,
  //         [nuevoStock, inv.id]
  //       );

  //       await connection.query(
  //         `INSERT INTO kardexg
  //         (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
  //         VALUES ($1, NOW(), $2, 0, $3, $4, $5, $6, $7, $8, 'VENTA')`,
  //         [inv.id_producto, existenciaInicial, cantidad, nuevoStock, Number(inv.costo_unitario), Number(item.precio_unitario_final), `Venta Fac: ${venta.nro_factura}`, venta.nro_factura]
  //       );
  //     }

  //     /* 5️⃣ DESCUENTO ESPECÍFICO DE LOTES */
  //     for (const lote of lotesQuery.rows) {
  //       const cantidad = Number(lote.cantidad_pedida);

  //       await connection.query(
  //         `UPDATE lotes SET cantidad = cantidad - $1 WHERE id = $2`,
  //         [cantidad, lote.id_lote]
  //       );

  //       const depQuery = await connection.query(
  //         `SELECT existencia_deposito FROM edeposito
  //         WHERE id_producto = $1 AND id_deposito = $2 FOR UPDATE`,
  //         [lote.id_producto, lote.id_deposito]
  //       );

  //       if (depQuery.rows.length > 0) {
  //         const exInicialDep = Number(depQuery.rows[0].existencia_deposito);
  //         const exFinalDep = exInicialDep - cantidad;

  //         await connection.query(
  //           `UPDATE edeposito SET existencia_deposito = $1
  //           WHERE id_producto = $2 AND id_deposito = $3`,
  //           [exFinalDep, lote.id_producto, lote.id_deposito]
  //         );

  //         await connection.query(
  //           `INSERT INTO kardexdep
  //           (id_producto, id_deposito, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
  //           VALUES ($1, $2, NOW(), $3, 0, $4, $5, 0, 0, $6, $7, 'VENTA')`,
  //           [lote.id_producto, lote.id_deposito, exInicialDep, cantidad, exFinalDep, `Venta Lote: ${lote.nro_lote}`, venta.nro_factura]
  //         );
  //       }
  //     }

  //     /* 5.5️⃣ OBTENER MÉDICOS PARA NOTIFICACIÓN */
  //     const personalQuery = await connection.query(
  //       `SELECT m.email 
  //        FROM venta_personal vp
  //        INNER JOIN personal p ON vp.id_personal = p.id
  //        INNER JOIN medicos m ON p.id_medico = m.id
  //        WHERE vp.id_venta = $1 
  //        AND m.notificaciones = TRUE 
  //        AND m.email IS NOT NULL AND m.email != ''`,
  //       [idVenta]
  //     );

  //     const medicosANotificar = personalQuery.rows;

  //     /* 6️⃣ FINALIZAR */
  //     await connection.query(`UPDATE ventas SET estado_venta = 'CONFIRMADA' WHERE id = $1`, [idVenta]);

  //     await connection.query("COMMIT");

  //     // Enviamos los correos DESPUÉS del COMMIT
  //     if (medicosANotificar.length > 0) {
  //       medicosANotificar.forEach(medico => {
  //         sendSurgeryNotification(medico.email, venta.nombre_paciente);
  //       });
  //     }

  //     return { status: true, code: 200, msg: "Venta confirmada y notificaciones enviadas." };

  //   } catch (error) {
  //     if (connection) await connection.query("ROLLBACK");
  //     return { status: false, code: 500, msg: error.message };
  //   } finally {
  //     if (connection) connection.release();
  //   }
  // }

  /* ================= ELIMINAR ================= */
  static async deleteSale(id) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      /* 1️⃣ Verificar si la venta existe */
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

      /* 2️⃣ Cambiar estatus a false (Anulación)
        No eliminamos los registros de ventas_detalle ni de personal 
        para que la información siga siendo visible en el sistema.
      */
      await connection.query(
        `UPDATE ventas SET estatus = false WHERE id = $1`,
        [id]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Venta marcada como cancelada correctamente"
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error al cancelar la venta",
        error: error.message
      };

    } finally {
      if (connection) connection.release();
    }
  }

}