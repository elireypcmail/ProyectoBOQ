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
        c.id,
        c.nro_factura,
        c.fecha_emision,
        c.fecha_vencimiento,
        c.total,
        c.abonado,
        c.estado_pago,
        prov.nombre AS proveedor,
        prov.documento AS proveedor_documento
      FROM compras c
      INNER JOIN proveedores prov ON c.id_proveedor = prov.id
      ORDER BY c.fecha_emision DESC, c.id DESC
    `);

    // Validación de resultados vacíos
    if (result.rows.length === 0) {
      return { 
        status: false, 
        code: 404, 
        msg: "No se encontraron registros de compras.",
        data: [] // Devolvemos array vacío para evitar errores en el .map() del front
      };
    }

    return { 
      status: true, 
      code: 200, 
      data: result.rows 
    };
  } catch (error) {
    return {
      status: false,
      code: 500,
      msg: "Error al obtener el listado de compras",
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

    const result = await connection.query(`
      SELECT 
        c.id_proveedor,
        c.nro_factura,
        c.fecha_emision,
        c.dias_plazo,
        c.fecha_vencimiento,
        -- Estructura de totales_cargos
        json_build_object(
          'subtotal', c.subtotal1,
          'porcentaje_descuento_global', c.descuentoPor,
          'monto_descuento_fijo', c.descuento,
          'monto_descuento_extra', 0, -- O el campo correspondiente si existe
          'cargos_monto', c.cargo,
          'monto_abonado', c.abonado,
          'total', c.total,
          'saldo_pendiente', (c.total - c.abonado)
        ) AS totales_cargos,
        -- Estructura de items (Array)
        (
          SELECT json_agg(
            json_build_object(
              'id_producto', i.id_producto,
              'Producto', cd.descripcion,
              'Cant', cd.cantidad,
              'Costo_Base', cd.costo_compra,
              'Descuento_Unitario', cd.descuento_unitario,
              'Cargo_Unitario', cd.cargo_unitario,
              'Costo_Ficha', cd.costo_unitario_final,
              'Subtotal_Linea', cd.subtotal2
            )
          )
          FROM compras_detalle cd
          INNER JOIN inventario i ON cd.id_inventario = i.id
          WHERE cd.id_compra = c.id
        ) AS items,
        -- Estructura de detalle_lotes (Array plano de todos los lotes de la compra)
        (
          SELECT json_agg(
            json_build_object(
              'id_producto', l.id_producto,
              'Producto', cd.descripcion,
              'nro_lote', l.nro_lote,
              'id_deposito', l.id_deposito,
              'fecha_vencimiento', l.fecha_vencimiento,
              'cantidad', cdl.cantidad,
              'costo_lote', cd.costo_unitario_final
            )
          )
          FROM compras_detalle cd
          INNER JOIN compras_detalle_lote cdl ON cd.id = cdl.id_detalle
          INNER JOIN lotes l ON cdl.id_lote = l.id
          WHERE cd.id_compra = c.id
        ) AS detalle_lotes
      FROM compras c
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return { status: false, code: 404, msg: "Compra no encontrada" };
    }

    // Retornamos el primer registro con el formato exacto solicitado
    return { status: true, code: 200, data: result.rows[0] };

  } catch (error) {
    console.error("Error en getShoppingById:", error);
    return {
      status: false,
      code: 500,
      msg: "Error al obtener el detalle de la compra",
      error: error.message,
    };
  } finally {
    if (connection) connection.release();
  }
}

// Helpers internos

  // static async createShopping(data) {
  //   let connection;

  //   try {
  //     connection = await pool.connect();
  //     await connection.query("BEGIN");

  //     const {
  //       id_proveedor,
  //       nro_factura,
  //       fecha_emision,
  //       dias_plazo,
  //       id_usuario,
  //       items,           // Array: { Producto, Cant, Costo_Base, Costo_Ficha, ... }
  //       detalle_lotes,   // Array: { nro_lote, cantidad, fecha_vencimiento, Producto }
  //       totales_cargos   // Objeto con cargos_monto, subtotal, etc.
  //     } = data;

  //     // 1️⃣ Cálculos Compras
  //     const fechaVencimiento = data.fecha_vencimiento || addDays(fecha_emision, dias_plazo);
  //     const m_cargos = parseMonto(totales_cargos?.cargos_monto);
  //     const m_subtotal = parseMonto(totales_cargos?.subtotal);
  //     const m_total = parseMonto(totales_cargos?.total);
  //     const m_abonado = parseMonto(totales_cargos?.monto_abonado);
  //     const m_descuento = parseMonto(totales_cargos?.monto_descuento_fijo);
  //     const p_descuento = parseMonto(totales_cargos?.porcentaje_descuento_global);
  //     const m_subtotal2 = parseMonto(totales_cargos?.subtotal - m_descuento);
      
  //     const compraResult = await connection.query(
  //       `INSERT INTO compras (
  //         fecha_emision, dias_plazo, fecha_vencimiento, id_proveedor, nro_factura, subtotal1, descuentoPor, descuento, subtotal2, cargo, total, abonado, estado_pago
  //       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
  //       // [id_proveedor, nro_factura, fecha_emision, dias_plazo, fechaVencimiento, 
  //       // m_subtotal, m_descuento_extra, m_cargos, m_total, 0, 'PENDIENTE']
  //       [fecha_emision, dias_plazo, fechaVencimiento, id_proveedor, nro_factura, m_subtotal, p_descuento, m_descuento, m_subtotal2, m_cargos , m_total, m_abonado, 'PENDIENTE']
  //     );
  //     const idCompra = compraResult.rows[0].id;

  //     // // 4️⃣ Registro en INGRESOS_EGRESOS (Punto 2.2 - 5)
  //     // await connection.query(
  //     //   `INSERT INTO ingresos_egresos (fecha, monto, id_compra, id_usuario) VALUES ($1, $2, $3, $4)`,
  //     //   [fecha_emision, m_total, idCompra, id_usuario]
  //     // );

  //     // 5️⃣ Procesar cada Producto
  //     for (const item of items) {
  //       const cantidadComp = parseMonto(item.Cant);
  //       const costoBase = parseMonto(item.Costo_Base);
  //       const costoFinal = parseMonto(item.Costo_Ficha) + cargoPorUnidad;

  //       // Obtener inventario actual
  //       const invQuery = await connection.query(
  //         `SELECT i.* FROM inventario i JOIN productos p ON i.id_producto = p.id 
  //         WHERE p.descripcion = $1`, [item.Producto]
  //       );
  //       if (invQuery.rows.length === 0) throw new Error(`Producto ${item.Producto} no existe.`);
        
  //       const inv = invQuery.rows[0];
  //       const nuevoPrecio = costoFinal * (1 + (parseFloat(inv.margen_ganancia) / 100));

  //       // Actualizar Ficha de Inventario
  //       await connection.query(
  //         `UPDATE inventario SET costo_unitario = $1, precio_venta = $2, 
  //         existencia_general = existencia_general + $3 WHERE id = $4`,
  //         [costoFinal, nuevoPrecio, cantidadComp, inv.id]
  //       );

  //       // Auditorías (Costo y Precio)
  //       await connection.query(
  //         `INSERT INTO auditoria (entidad, id_entidad, accion, datos_previos, datos_nuevos, usuario_id)
  //         VALUES ('inventario', $1, 'CAMBIO_COSTO_PRECIO', $2, $3, $4)`,
  //         [inv.id, JSON.stringify({costo: inv.costo_unitario, precio: inv.precio_venta}), 
  //         JSON.stringify({costo: costoFinal, precio: nuevoPrecio}), id_usuario]
  //       );

  //       // Aumentar existencia en depósito (edeposito)
  //       await connection.query(
  //         `UPDATE edeposito SET existencia_deposito = existencia_deposito + $1 
  //         WHERE id_producto = $2 AND id_deposito = $3`,
  //         [cantidadComp, inv.id_producto, id_deposito_destino]
  //       );

  //       // Registro en Kardex General
  //       await connection.query(
  //         `INSERT INTO kardexg (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
  //         VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9, 'COMPRA')`,
  //         [inv.id_producto, fecha_emision, inv.existencia_general, cantidadComp, 
  //         (parseInt(inv.existencia_general) + cantidadComp), costoFinal, nuevoPrecio, `Compra Fac: ${nro_factura}`, nro_factura]
  //       );

  //       // Crear Detalle de Compra
  //       const detRes = await connection.query(
  //         `INSERT INTO compras_detalle (id_compra, id_inventario, descripcion, cantidad, costo_compra, costo_unitario_final, cargo_unitario)
  //         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
  //         [idCompra, inv.id, item.Producto, cantidadComp, costoBase, costoFinal, cargoPorUnidad]
  //       );
  //       const idDetalle = detRes.rows[0].id;

  //       // 6️⃣ Manejo de Lotes (Punto 2.2 - 3 y 4)
  //       if (detalle_lotes && Array.isArray(detalle_lotes)) {
  //         const lotesProducto = detalle_lotes.filter(l => l.Producto === item.Producto);
  //         let sumaCantLotes = 0;

  //         for (const lote of lotesProducto) {
  //           const cLote = parseMonto(lote.cantidad);
  //           sumaCantLotes += cLote;

  //           const loteExist = await connection.query(
  //             `SELECT id FROM lotes WHERE nro_lote = $1 AND id_producto = $2 AND id_deposito = $3`,
  //             [lote.nro_lote, inv.id_producto, id_deposito_destino]
  //           );

  //           let idLote;
  //           if (loteExist.rows.length > 0) {
  //             idLote = loteExist.rows[0].id;
  //             await connection.query(`UPDATE lotes SET cantidad = cantidad + $1 WHERE id = $2`, [cLote, idLote]);
  //           } else {
  //             const nl = await connection.query(
  //               `INSERT INTO lotes (id_producto, id_deposito, nro_lote, cantidad, fecha_vencimiento)
  //               VALUES ($1, $2, $3, $4, $5) RETURNING id`,
  //               [inv.id_producto, id_deposito_destino, lote.nro_lote, cLote, lote.fecha_vencimiento]
  //             );
  //             idLote = nl.rows[0].id;
  //           }
  //           await connection.query(
  //             `INSERT INTO compras_detalle_lote (id_detalle, id_lote, cantidad, fecha_caducidad) VALUES ($1, $2, $3, $4)`,
  //             [idDetalle, idLote, cLote, lote.fecha_vencimiento]
  //           );
  //         }

  //         if (sumaCantLotes > cantidadComp) {
  //           throw new Error(`La cantidad de lotes (${sumaCantLotes}) para ${item.Producto} supera la compra (${cantidadComp})`);
  //         }
  //       }
  //     }

  //     await connection.query("COMMIT");
  //     return { status: true, code: 201, msg: "Factura de compra procesada correctamente." };

  //   } catch (error) {
  //     if (connection) await connection.query("ROLLBACK");
  //     return { status: false, code: 500, msg: "Error al procesar la compra", error: error.message };
  //   } finally {
  //     if (connection) connection.release();
  //   }
  // }

//   static async createShopping(data) {
//   let connection;

//   try {
//     connection = await pool.connect();
//     await connection.query("BEGIN");

//     const {
//       id_proveedor,
//       nro_factura,
//       fecha_emision,
//       dias_plazo,
//       fecha_vencimiento,
//       id_usuario,
//       id_deposito_destino, // Asegúrate de recibirlo del frontend
//       items,           
//       detalle_lotes,   
//       totales_cargos   
//     } = data;

//     // 1️⃣ Preparación de montos globales
//     const fechaVenc = fecha_vencimiento || fecha_emision; 
//     const m_subtotal = parseMonto(totales_cargos?.subtotal);
//     const p_descuento = parseMonto(totales_cargos?.porcentaje_descuento_global);
//     const m_descuento = parseMonto(totales_cargos?.monto_descuento_fijo);
//     const m_cargos = parseMonto(totales_cargos?.cargos_monto);
//     const m_total = parseMonto(totales_cargos?.total);
//     const m_abonado = parseMonto(totales_cargos?.monto_abonado);
//     const m_subtotal2 = m_subtotal - m_descuento;

//     // 2️⃣ Insertar Cabecera de Compra
//     const compraResult = await connection.query(
//       `INSERT INTO compras (
//         fecha_emision, dias_plazo, fecha_vencimiento, id_proveedor, nro_factura, 
//         subtotal1, descuentoPor, descuento, subtotal2, cargo, total, abonado, estado_pago
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
//       [fecha_emision, dias_plazo, fechaVenc, id_proveedor, nro_factura, 
//        m_subtotal, p_descuento, m_descuento, m_subtotal2, m_cargos, m_total, m_abonado, 'PENDIENTE']
//     );
//     const idCompra = compraResult.rows[0].id;

//     // 3️⃣ Procesar cada Producto
//     for (const item of items) {
//       const cantidadComp = parseMonto(item.Cant);
//       const costoBase = parseMonto(item.Costo_Base);
//       const descUnitario = parseMonto(item.Descuento_Unitario);
//       const cargoUnitario = parseMonto(item.Cargo_Unitario);
//       const costoFinal = parseMonto(item.Costo_Ficha); // Ya viene calculado del front: (Base - Desc + Cargo)

//       // Buscar producto en inventario por ID (más seguro que descripción)
//       const invQuery = await connection.query(
//         `SELECT i.* FROM inventario i WHERE i.id_producto = $1 LIMIT 1`, 
//         [item.id_producto]
//       );
      
//       if (invQuery.rows.length === 0) throw new Error(`Producto ID ${item.id_producto} no existe en inventario.`);
      
//       const inv = invQuery.rows[0];
      
//       // Calcular nuevo precio de venta basado en el margen pre-configurado
//       // const nuevoPrecio = costoFinal * (1 + (parseFloat(inv.margen_ganancia) / 100));
//       const nuevoPrecio = costoFinal * (1 + (parseFloat(inv.margen_ganancia) / 100));

//       // Actualizar Ficha de Inventario
//       await connection.query(
//         `UPDATE inventario SET costo_unitario = $1, precio_venta = $2, 
//         existencia_general = existencia_general + $3 WHERE id = $4`,
//         [costoFinal, nuevoPrecio, cantidadComp, inv.id]
//       );

//       // Auditoría de cambio
//       await connection.query(
//         `INSERT INTO auditoria (entidad, id_entidad, accion, datos_previos, datos_nuevos, usuario_id)
//         VALUES ('inventario', $1, 'CAMBIO_COSTO_PRECIO', $2, $3, $4)`,
//         [inv.id, 
//          JSON.stringify({costo: inv.costo_unitario, precio: inv.precio_venta}), 
//          JSON.stringify({costo: costoFinal, precio: nuevoPrecio}), 
//          id_usuario]
//       );

//       // // Actualizar Existencia en Depósito Específico
//       // await connection.query(
//       //   `UPDATE edeposito SET existencia_deposito = existencia_deposito + $1 
//       //   WHERE id_producto = $2 AND id_deposito = $3`,
//       //   [cantidadComp, inv.id_producto, id_deposito_destino]
//       // );

//       // Registro en Kardex
//       await connection.query(
//         `INSERT INTO kardexg (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
//         VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9, 'COMPRA')`,
//         [inv.id_producto, fecha_emision, inv.existencia_general, cantidadComp, 
//         (parseMonto(inv.existencia_general) + cantidadComp), costoFinal, nuevoPrecio, `Compra Fac: ${nro_factura}`, nro_factura]
//       );

//       // 4️⃣ INSERTAR EN COMPRAS_DETALLE (Ajustado a tu nueva tabla)
//       const detRes = await connection.query(
//         `INSERT INTO compras_detalle (
//           id_compra, id_inventario, descripcion, cantidad, costo_compra, 
//           descuento_por1, descuento_unitario, cargo_unitario, costo_unitario_final, subtotal2
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
//         [
//           idCompra, 
//           inv.id, 
//           item.Producto, 
//           cantidadComp, 
//           costoBase, 
//           p_descuento,    // % global aplicado a la linea
//           descUnitario,  // monto prorrateado restado
//           cargoUnitario, // monto prorrateado sumado
//           costoFinal,    // costo ficha
//           parseMonto(item.Subtotal_Linea) // subtotal de la linea
//         ]
//       );
//       const idDetalle = detRes.rows[0].id;

//       // 5️⃣ Manejo de Lotes
//       if (detalle_lotes && Array.isArray(detalle_lotes)) {
//         const lotesProducto = detalle_lotes.filter(l => l.id_producto === item.id_producto);
        
//         for (const lote of lotesProducto) {
//           const cLote = parseMonto(lote.cantidad);

//           const loteExist = await connection.query(
//             `SELECT id FROM lotes WHERE nro_lote = $1 AND id_producto = $2 AND id_deposito = $3`,
//             [lote.nro_lote, item.id_producto, id_deposito_destino]
//           );

//           let idLote;
//           if (loteExist.rows.length > 0) {
//             idLote = loteExist.rows[0].id;
//             await connection.query(`UPDATE lotes SET cantidad = cantidad + $1 WHERE id = $2`, [cLote, idLote]);
//           } else {
//             const nl = await connection.query(
//               `INSERT INTO lotes (id_producto, id_deposito, nro_lote, cantidad, fecha_vencimiento)
//               VALUES ($1, $2, $3, $4, $5) RETURNING id`,
//               [item.id_producto, id_deposito_destino, lote.nro_lote, cLote, lote.fecha_vencimiento]
//             );
//             idLote = nl.rows[0].id;
//           }

//           await connection.query(
//             `INSERT INTO compras_detalle_lote (id_detalle, id_lote, cantidad, fecha_caducidad) VALUES ($1, $2, $3, $4)`,
//             [idDetalle, idLote, cLote, lote.fecha_vencimiento]
//           );
//         }
//       }
//     }

//     await connection.query("COMMIT");
//     return { status: true, code: 201, msg: "Compra registrada con éxito." };

//   } catch (error) {
//     if (connection) await connection.query("ROLLBACK");
//     console.error(error);
//     return { status: false, code: 500, msg: "Error interno", error: error.message };
//   } finally {
//     if (connection) connection.release();
//   }
// }

// static async createShopping(data) {
//   let connection;

//   try {
//     connection = await pool.connect();
//     await connection.query("BEGIN");

//     const {
//       id_proveedor,
//       nro_factura,
//       fecha_emision,
//       dias_plazo,
//       fecha_vencimiento,
//       id_usuario,
//       items,           
//       detalle_lotes,   
//       totales_cargos   
//     } = data;

//     // 1️⃣ Preparación de montos globales
//     const fechaVenc = fecha_vencimiento || fecha_emision; 
//     const m_subtotal = parseMonto(totales_cargos?.subtotal);
//     const p_descuento = parseMonto(totales_cargos?.porcentaje_descuento_global);
//     const m_descuento = parseMonto(totales_cargos?.monto_descuento_fijo);
//     const m_cargos = parseMonto(totales_cargos?.cargos_monto);
//     const m_total = parseMonto(totales_cargos?.total);
//     const m_abonado = parseMonto(totales_cargos?.monto_abonado);
//     const m_subtotal2 = m_subtotal - m_descuento;

//     // 2️⃣ Insertar Cabecera de Compra
//     const compraResult = await connection.query(
//       `INSERT INTO compras (
//         fecha_emision, dias_plazo, fecha_vencimiento, id_proveedor, nro_factura, 
//         subtotal1, descuentoPor, descuento, subtotal2, cargo, total, abonado, estado_pago
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
//       [fecha_emision, dias_plazo, fechaVenc, id_proveedor, nro_factura, 
//        m_subtotal, p_descuento, m_descuento, m_subtotal2, m_cargos, m_total, m_abonado, 'PENDIENTE']
//     );
//     const idCompra = compraResult.rows[0].id;

//     // 3️⃣ Procesar cada Producto
//     for (const item of items) {
//       const cantidadComp = parseMonto(item.Cant);
//       const costoFinal = parseMonto(item.Costo_Ficha);

//       const invQuery = await connection.query(
//         `SELECT i.* FROM inventario i WHERE i.id_producto = $1 LIMIT 1`, 
//         [item.id_producto]
//       );
      
//       if (invQuery.rows.length === 0) throw new Error(`Producto ID ${item.id_producto} no existe.`);
//       const inv = invQuery.rows[0];
      
//       const nuevoPrecio = costoFinal * (1 + (parseFloat(inv.margen_ganancia) / 100));

//       // Actualizar Ficha de Inventario (Existencia General)
//       await connection.query(
//         `UPDATE inventario SET costo_unitario = $1, precio_venta = $2, 
//         existencia_general = existencia_general + $3 WHERE id = $4`,
//         [costoFinal, nuevoPrecio, cantidadComp, inv.id]
//       );

//       // Auditoría
//       await connection.query(
//         `INSERT INTO auditoria (entidad, id_entidad, accion, datos_previos, datos_nuevos, usuario_id)
//         VALUES ('inventario', $1, 'CAMBIO_COSTO_PRECIO', $2, $3, $4)`,
//         [inv.id, JSON.stringify({costo: inv.costo_unitario, precio: inv.precio_venta}), 
//          JSON.stringify({costo: costoFinal, precio: nuevoPrecio}), id_usuario]
//       );

//       // Registro en Kardex
//       await connection.query(
//         `INSERT INTO kardexg (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
//         VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9, 'COMPRA')`,
//         [inv.id_producto, fecha_emision, inv.existencia_general, cantidadComp, 
//         (parseMonto(inv.existencia_general) + cantidadComp), costoFinal, nuevoPrecio, `Compra Fac: ${nro_factura}`, nro_factura]
//       );

//       // 4️⃣ INSERTAR EN COMPRAS_DETALLE
//       const detRes = await connection.query(
//         `INSERT INTO compras_detalle (
//           id_compra, id_inventario, descripcion, cantidad, costo_compra, 
//           descuento_por1, descuento_unitario, cargo_unitario, costo_unitario_final, subtotal2
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
//         [idCompra, inv.id, item.Producto, cantidadComp, parseMonto(item.Costo_Base), 
//          p_descuento, parseMonto(item.Descuento_Unitario), parseMonto(item.Cargo_Unitario), 
//          costoFinal, parseMonto(item.Subtotal_Linea)]
//       );
//       const idDetalle = detRes.rows[0].id;

//       // 5️⃣ Manejo de Lotes (Depósito independiente por lote)
//       if (detalle_lotes && Array.isArray(detalle_lotes)) {
//         const lotesProducto = detalle_lotes.filter(l => l.id_producto === item.id_producto);
        
//         for (const lote of lotesProducto) {
//           const cLote = parseMonto(lote.cantidad);
//           const depLote = lote.id_deposito;

//           if (!depLote) throw new Error(`El lote ${lote.nro_lote} del producto ${item.Producto} no tiene un depósito asignado.`);

//           // A. Manejo de tabla LOTES (Validación manual)
//           const loteExist = await connection.query(
//             `SELECT id FROM lotes WHERE nro_lote = $1 AND id_producto = $2 AND id_deposito = $3`,
//             [lote.nro_lote, item.id_producto, depLote]
//           );

//           let idLote;
//           if (loteExist.rows.length > 0) {
//             idLote = loteExist.rows[0].id;
//             await connection.query(`UPDATE lotes SET cantidad = cantidad + $1 WHERE id = $2`, [cLote, idLote]);
//           } else {
//             const nl = await connection.query(
//               `INSERT INTO lotes (id_producto, id_deposito, nro_lote, cantidad, fecha_vencimiento)
//               VALUES ($1, $2, $3, $4, $5) RETURNING id`,
//               [item.id_producto, depLote, lote.nro_lote, cLote, lote.fecha_vencimiento]
//             );
//             idLote = nl.rows[0].id;
//           }

//           // B. Actualizar Existencia en Depósito Específico (Validación manual corregida)
// // B. Actualizar Existencia en Depósito Específico (Tabla EDEPOSITO)
// const edepExist = await connection.query(
//   `SELECT id FROM edeposito WHERE id_producto = $1 AND id_deposito = $2`,
//   [item.id_producto, depLote]
// );

// if (edepExist.rows.length > 0) {
//   // Si ya existe, actualizamos
//   await connection.query(
//     `UPDATE edeposito SET existencia_deposito = existencia_deposito + $1 
//      WHERE id_producto = $2 AND id_deposito = $3`,
//     [cLote, item.id_producto, depLote]
//   );
// } else {
//   // Si no existe, lo creamos. 
//   // IMPORTANTE: Agregamos stock_minimo_deposito para evitar el error de restricción NOT NULL
//   await connection.query(
//     `INSERT INTO edeposito (id_producto, id_deposito, existencia_deposito, stock_minimo_deposito)
//      VALUES ($1, $2, $3, $4)`,
//     [item.id_producto, depLote, cLote, 0] // Enviamos 0 como stock mínimo inicial
//   );
// }

//           // C. Relación detalle compra con lote
//           await connection.query(
//             `INSERT INTO compras_detalle_lote (id_detalle, id_lote, cantidad, fecha_caducidad) VALUES ($1, $2, $3, $4)`,
//             [idDetalle, idLote, cLote, lote.fecha_vencimiento]
//           );
//         }
//       }
//     }

//     await connection.query("COMMIT");
//     return { status: true, code: 201, msg: "Compra registrada con éxito." };

//   } catch (error) {
//     if (connection) await connection.query("ROLLBACK");
//     console.error("Error en createShopping:", error);
//     return { status: false, code: 500, msg: "Error al procesar la compra", error: error.message };
//   } finally {
//     if (connection) connection.release();
//   }
// }

static async createShopping(data) {
  let connection;

  try {
    connection = await pool.connect();
    await connection.query("BEGIN");

    const {
      id_proveedor,
      nro_factura,
      fecha_emision,
      dias_plazo,
      fecha_vencimiento,
      id_usuario,
      items,           
      detalle_lotes,   
      totales_cargos   
    } = data;

    // 1️⃣ Preparación de montos globales
    const fechaVenc = fecha_vencimiento || fecha_emision; 
    const m_subtotal = parseMonto(totales_cargos?.subtotal);
    const p_descuento = parseMonto(totales_cargos?.porcentaje_descuento_global);
    const m_descuento = parseMonto(totales_cargos?.monto_descuento_fijo);
    const m_cargos = parseMonto(totales_cargos?.cargos_monto);
    const m_total = parseMonto(totales_cargos?.total);
    const m_abonado = parseMonto(totales_cargos?.monto_abonado);
    const m_subtotal2 = m_subtotal - m_descuento;

    // 2️⃣ Insertar Cabecera de Compra
    const compraResult = await connection.query(
      `INSERT INTO compras (
        fecha_emision, dias_plazo, fecha_vencimiento, id_proveedor, nro_factura, 
        subtotal1, descuentoPor, descuento, subtotal2, cargo, total, abonado, estado_pago
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [fecha_emision, dias_plazo, fechaVenc, id_proveedor, nro_factura, 
       m_subtotal, p_descuento, m_descuento, m_subtotal2, m_cargos, m_total, m_abonado, 'PENDIENTE']
    );
    const idCompra = compraResult.rows[0].id;

    // 3️⃣ Procesar cada Producto
    for (const item of items) {
      const cantidadComp = parseMonto(item.Cant);
      const costoFinal = parseMonto(item.Costo_Ficha);

      const invQuery = await connection.query(
        `SELECT i.* FROM inventario i WHERE i.id_producto = $1 LIMIT 1`, 
        [item.id_producto]
      );
      
      if (invQuery.rows.length === 0) throw new Error(`Producto ID ${item.id_producto} no existe.`);
      const inv = invQuery.rows[0];
      
      const nuevoPrecio = costoFinal * (1 + (parseFloat(inv.margen_ganancia) / 100));

      // Actualizar Ficha de Inventario (Existencia General)
      await connection.query(
        `UPDATE inventario SET costo_unitario = $1, precio_venta = $2, 
        existencia_general = existencia_general + $3 WHERE id = $4`,
        [costoFinal, nuevoPrecio, cantidadComp, inv.id]
      );

      // ============================================================
      // AJUSTE DE AUDITORÍA (Estilo updateProduct)
      // ============================================================
      const hayCambiosValores = 
        Number(costoFinal) !== Number(inv.costo_unitario) || 
        Number(nuevoPrecio) !== Number(inv.precio_venta);

      if (hayCambiosValores) {
        await connection.query(
          `INSERT INTO auditoria (
            entidad, id_entidad, accion, datos_previos, datos_nuevos, usuario_id
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'inventario',
            inv.id_producto,
            'ACTUALIZACION_COSTO_MARGEN_PRECIO',
            JSON.stringify({
              costo_unitario: inv.costo_unitario,
              margen_ganancia: inv.margen_ganancia,
              precio_venta: inv.precio_venta,
            }),
            JSON.stringify({
              costo_unitario: costoFinal,
              margen_ganancia: inv.margen_ganancia, // En compras el margen suele mantenerse igual
              precio_venta: nuevoPrecio,
            }),
            id_usuario
          ]
        );
      }
      // ============================================================

      // Registro en Kardex
      await connection.query(
        `INSERT INTO kardexg (id_producto, fecha, existencia_inicial, entrada, salida, existencia_final, costo, precio, detalle, documento, tipo)
        VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8, $9, 'COMPRA')`,
        [inv.id_producto, fecha_emision, inv.existencia_general, cantidadComp, 
        (parseMonto(inv.existencia_general) + cantidadComp), costoFinal, nuevoPrecio, `Compra Fac: ${nro_factura}`, nro_factura]
      );

      // 4️⃣ INSERTAR EN COMPRAS_DETALLE
      const detRes = await connection.query(
        `INSERT INTO compras_detalle (
          id_compra, id_inventario, descripcion, cantidad, costo_compra, 
          descuento_por1, descuento_unitario, cargo_unitario, costo_unitario_final, subtotal2
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [idCompra, inv.id, item.Producto, cantidadComp, parseMonto(item.Costo_Base), 
         p_descuento, parseMonto(item.Descuento_Unitario), parseMonto(item.Cargo_Unitario), 
         costoFinal, parseMonto(item.Subtotal_Linea)]
      );
      const idDetalle = detRes.rows[0].id;

      // 5️⃣ Manejo de Lotes
      if (detalle_lotes && Array.isArray(detalle_lotes)) {
        const lotesProducto = detalle_lotes.filter(l => l.id_producto === item.id_producto);
        
        for (const lote of lotesProducto) {
          const cLote = parseMonto(lote.cantidad);
          const depLote = lote.id_deposito;

          if (!depLote) throw new Error(`El lote ${lote.nro_lote} del producto ${item.Producto} no tiene un depósito asignado.`);

          const loteExist = await connection.query(
            `SELECT id FROM lotes WHERE nro_lote = $1 AND id_producto = $2 AND id_deposito = $3`,
            [lote.nro_lote, item.id_producto, depLote]
          );

          let idLote;
          if (loteExist.rows.length > 0) {
            idLote = loteExist.rows[0].id;
            await connection.query(`UPDATE lotes SET cantidad = cantidad + $1 WHERE id = $2`, [cLote, idLote]);
          } else {
            const nl = await connection.query(
              `INSERT INTO lotes (id_producto, id_deposito, nro_lote, cantidad, fecha_vencimiento)
              VALUES ($1, $2, $3, $4, $5) RETURNING id`,
              [item.id_producto, depLote, lote.nro_lote, cLote, lote.fecha_vencimiento]
            );
            idLote = nl.rows[0].id;
          }

          const edepExist = await connection.query(
            `SELECT id FROM edeposito WHERE id_producto = $1 AND id_deposito = $2`,
            [item.id_producto, depLote]
          );

          if (edepExist.rows.length > 0) {
            await connection.query(
              `UPDATE edeposito SET existencia_deposito = existencia_deposito + $1 
               WHERE id_producto = $2 AND id_deposito = $3`,
              [cLote, item.id_producto, depLote]
            );
          } else {
            await connection.query(
              `INSERT INTO edeposito (id_producto, id_deposito, existencia_deposito, stock_minimo_deposito)
               VALUES ($1, $2, $3, $4)`,
              [item.id_producto, depLote, cLote, 0]
            );
          }

          await connection.query(
            `INSERT INTO compras_detalle_lote (id_detalle, id_lote, cantidad, fecha_caducidad) VALUES ($1, $2, $3, $4)`,
            [idDetalle, idLote, cLote, lote.fecha_vencimiento]
          );
        }
      }
    }

    await connection.query("COMMIT");
    return { status: true, code: 201, msg: "Compra registrada con éxito." };

  } catch (error) {
    if (connection) await connection.query("ROLLBACK");
    console.error("Error en createShopping:", error);
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