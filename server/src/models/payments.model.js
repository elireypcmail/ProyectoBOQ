import pool from "../connection/db.connect.js";

const parseMonto = (valor) => {
  if (!valor) return 0;
  if (typeof valor === "number") return valor;
  return parseFloat(valor.toString().replace(/\./g, "").replace(",", "."));
};

export class PaymentsModel {

  /* ================= DETALLE ================= */
  static async getPaymentsById(id) {
    let connection;

    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT 
          vp.*,
          v.nro_factura
        FROM ventas_pagos vp
        INNER JOIN ventas v ON v.id = vp.id_venta
        WHERE vp.id_venta = $1
        ORDER BY vp.fecha_pago DESC
      `, [id]);

      if (!result.rows.length) {
        return { 
          status: false, 
          code: 404, 
          msg: "No hay pagos para esta venta" 
        };
      }

      return {
        status: true,
        code: 200,
        data: result.rows // ✅ ahora sí todos los pagos
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        msg: "Error al obtener pagos",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= CREAR ================= */
  static async createPayment(data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const { id_venta, monto, notas } = data;

      // ✅ Parseo correcto SOLO para el input
      const montoParseado = Number(monto);

      if (isNaN(montoParseado) || montoParseado <= 0) {
        throw new Error("El monto ingresado no es válido");
      }

      /* 1️⃣ VALIDAR VENTA (bloqueada para concurrencia) */
      const venta = await connection.query(
        `SELECT total FROM ventas WHERE id = $1 FOR UPDATE`,
        [id_venta]
      );

      if (!venta.rows.length) {
        throw new Error("La venta no existe");
      }

      const totalVenta = Number(venta.rows[0].total || 0);

      /* 2️⃣ INSERTAR PAGO */
      const pago = await connection.query(
        `INSERT INTO ventas_pagos (id_venta, monto, notas)
        VALUES ($1,$2,$3)
        RETURNING *`,
        [id_venta, montoParseado, notas || null]
      );

      /* 3️⃣ RECALCULAR TOTAL ABONADO */
      const suma = await connection.query(
        `SELECT COALESCE(SUM(monto),0) as total_pagado
        FROM ventas_pagos
        WHERE id_venta = $1 AND estatus = TRUE`,
        [id_venta]
      );

      const totalPagado = Number(suma.rows[0].total_pagado || 0);

      /* 🚨 VALIDACIÓN ANTI-SOBREPAGO */
      if (totalPagado > totalVenta) {
        throw new Error("El monto abonado excede el total de la venta");
      }

      /* 4️⃣ DEFINIR ESTADO CORRECTO */
      let estado_pago = "Pendiente";

      if (totalPagado === 0) {
        estado_pago = "Pendiente";
      } else if (totalPagado < totalVenta) {
        estado_pago = "Abono Parcial";
      } else {
        estado_pago = "Pagado";
      }

      /* 5️⃣ ACTUALIZAR VENTA */
      await connection.query(
        `UPDATE ventas 
        SET abonado = $1, estado_pago = $2
        WHERE id = $3`,
        [totalPagado, estado_pago, id_venta]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 201,
        msg: "Pago registrado correctamente",
        data: pago.rows[0]
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: error.message || "Error al registrar pago",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= EDITAR ================= */
  static async editPayment(id, data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const { monto, notas } = data;

      const pagoExistente = await connection.query(
        `SELECT * FROM ventas_pagos WHERE id = $1 FOR UPDATE`,
        [id]
      );

      if (!pagoExistente.rows.length) {
        throw new Error("Pago no encontrado");
      }

      const pago = pagoExistente.rows[0];

      /* 1️⃣ ACTUALIZAR */
      await connection.query(
        `UPDATE ventas_pagos
         SET monto = $1,
             notas = $2
         WHERE id = $3`,
        [parseMonto(monto), notas || null, id]
      );

      /* 2️⃣ RECALCULAR VENTA */
      const suma = await connection.query(
        `SELECT COALESCE(SUM(monto),0) as total_pagado
         FROM ventas_pagos
         WHERE id_venta = $1 AND estatus = TRUE`,
        [pago.id_venta]
      );

      const totalPagado = parseMonto(suma.rows[0].total_pagado);

      const venta = await connection.query(
        `SELECT total FROM ventas WHERE id = $1`,
        [pago.id_venta]
      );

      const totalVenta = parseMonto(venta.rows[0].total);

      let estado_pago = "PENDIENTE";

      if (totalPagado === 0) estado_pago = "PENDIENTE";
      else if (totalPagado < totalVenta) estado_pago = "PARCIAL";
      else estado_pago = "PAGADO";

      await connection.query(
        `UPDATE ventas 
         SET abonado = $1, estado_pago = $2
         WHERE id = $3`,
        [totalPagado, estado_pago, pago.id_venta]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Pago actualizado correctamente"
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error al editar pago",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= ELIMINAR ================= */
  static async deletePayment(id) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const pago = await connection.query(
        `SELECT * FROM ventas_pagos WHERE id = $1 FOR UPDATE`,
        [id]
      );

      if (!pago.rows.length) {
        throw new Error("Pago no encontrado");
      }

      const id_venta = pago.rows[0].id_venta;

      /* 🔹 BORRADO LÓGICO */
      await connection.query(
        `UPDATE ventas_pagos SET estatus = FALSE WHERE id = $1`,
        [id]
      );

      /* 🔹 RECALCULAR */
      const suma = await connection.query(
        `SELECT COALESCE(SUM(monto),0) as total_pagado
         FROM ventas_pagos
         WHERE id_venta = $1 AND estatus = TRUE`,
        [id_venta]
      );

      const totalPagado = parseMonto(suma.rows[0].total_pagado);

      const venta = await connection.query(
        `SELECT total FROM ventas WHERE id = $1`,
        [id_venta]
      );

      const totalVenta = parseMonto(venta.rows[0].total);

      let estado_pago = "PENDIENTE";

      if (totalPagado === 0) estado_pago = "PENDIENTE";
      else if (totalPagado < totalVenta) estado_pago = "PARCIAL";
      else estado_pago = "PAGADO";

      await connection.query(
        `UPDATE ventas 
         SET abonado = $1, estado_pago = $2
         WHERE id = $3`,
        [totalPagado, estado_pago, id_venta]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Pago eliminado correctamente"
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error al eliminar pago",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

}