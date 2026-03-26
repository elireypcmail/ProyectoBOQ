// models/budgets.model.js
import pool from "../connection/db.connect.js";

const parseMonto = (valor) => {
  if (!valor) return 0;
  if (typeof valor === "number") return valor;
  return parseFloat(valor.toString().replace(/\./g, "").replace(",", "."));
};

export class BudgetsModel {

  /* ================= LIST ================= */

  static async getAllBudgets() {
    let connection;

    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT 
          p.id,
          p.nro_presupuesto,
          p.total,
          p.estado_pago,
          p.estatus,
          p.fecha_creacion,
          
          -- Related Data
          pac.nombre AS paciente,
          c.nombre AS clinica,
          s.nombre AS seguro
        FROM presupuestos p
        LEFT JOIN pacientes pac ON pac.id = p.id_paciente
        LEFT JOIN clinicas c ON c.id = p.id_clinica
        LEFT JOIN seguros s ON s.id = p.id_seguro
        ORDER BY p.fecha_creacion DESC, p.id DESC
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
        msg: "Error retrieving budgets",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= DETAIL ================= */

  static async getBudgetById(id) {
    let connection;

    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT 
          p.id,
          p.nro_presupuesto,
          p.estado_pago,
          p.estatus,
          p.total,
          p.fecha_creacion,

          p.id_paciente,
          p.id_clinica,
          p.id_seguro,

          pac.nombre AS paciente_nombre,
          c.nombre AS clinica_nombre,
          s.nombre AS seguro_nombre,

          /* BUDGET ITEMS */
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id_detalle', pd.id,
                  'id_inventario', pd.id_inventario,
                  'cantidad', pd.cantidad,
                  'precio_venta', pd.precio_venta,
                  'cantidad_vendida', pd.cantidad_vendida,
                  'backorder', pd.backorder
                )
              )
              FROM presupuestos_detalle pd
              WHERE pd.id_presupuesto = p.id
            ),
            '[]'::json
          ) AS items

        FROM presupuestos p
        LEFT JOIN pacientes pac ON pac.id = p.id_paciente
        LEFT JOIN clinicas c ON c.id = p.id_clinica
        LEFT JOIN seguros s ON s.id = p.id_seguro

        WHERE p.id = $1
      `, [id]);

      if (!result.rows.length) {
        return { status: false, code: 404, msg: "Budget not found" };
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
        msg: "Error retrieving budget",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= CREATE BUDGET ================= */

  static async createBudget(data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      // Note: The controller sends 'cliente', mapped here to 'id_paciente' as a fallback
      const {
        id_paciente,
        cliente,
        id_clinica,
        id_seguro,
        detalle = [],
        total,
        estado_pago
      } = data;

      const targetPatient = id_paciente || cliente;
      const formattedEstadoPago = estado_pago ? estado_pago.toUpperCase() : "PENDIENTE";

      /* 1️⃣ GENERATE BUDGET NUMBER */
      const lastBudget = await connection.query(`
        SELECT nro_presupuesto FROM presupuestos ORDER BY id DESC LIMIT 1
      `);

      let correlativo = 1;

      if (lastBudget.rows.length) {
        const last = lastBudget.rows[0].nro_presupuesto;
        const number = parseInt(last.replace("P", ""), 10);
        correlativo = number + 1;
      }

      const nroPresupuesto = `P${String(correlativo).padStart(6, "0")}`;

      /* 2️⃣ CREATE BUDGET HEADER */
      const budgetRes = await connection.query(
        `INSERT INTO presupuestos (
          id_paciente,
          id_clinica,
          id_seguro,
          nro_presupuesto,
          total,
          estado_pago
        ) VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING id`,
        [
          targetPatient,
          id_clinica || null,
          id_seguro || null,
          nroPresupuesto,
          parseMonto(total),
          formattedEstadoPago
        ]
      );

      const idPresupuesto = budgetRes.rows[0].id;

      /* 3️⃣ INSERT DETAILS */
      for (const item of detalle) {
        await connection.query(
          `INSERT INTO presupuestos_detalle (
            id_presupuesto,
            id_inventario,
            cantidad,
            precio_venta,
            cantidad_vendida,
            backorder
          )
          VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            idPresupuesto,
            item.id_inventario,
            parseMonto(item.cantidad),
            parseMonto(item.precio_venta),
            item.cantidad_vendida || 0,
            item.backorder || 0
          ]
        );
      }

      await connection.query("COMMIT");

      return {
        status: true,
        code: 201,
        msg: "Budget created successfully",
        data: {
          id_presupuesto: idPresupuesto,
          nro_presupuesto: nroPresupuesto
        }
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error creating budget",
        error: error.message
      };

    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= UPDATE BUDGET ================= */

  static async updateBudget(id, data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const {
        id_paciente,
        cliente,
        id_clinica,
        id_seguro,
        detalle = [],
        total,
        estado_pago
      } = data;

      const targetPatient = id_paciente || cliente;
      const formattedEstadoPago = estado_pago ? estado_pago.toUpperCase() : "PENDIENTE";

      /* 1️⃣ UPDATE BUDGET HEADER */
      await connection.query(
        `UPDATE presupuestos SET
          id_paciente = $1,
          id_clinica = $2,
          id_seguro = $3,
          total = $4,
          estado_pago = $5
        WHERE id = $6`,
        [
          targetPatient,
          id_clinica || null,
          id_seguro || null,
          parseMonto(total),
          formattedEstadoPago,
          id
        ]
      );

      /* 2️⃣ CLEAN OLD DETAILS */
      // presupuestos_detalle is automatically deleted if ON DELETE CASCADE was configured properly, 
      // but manually clearing ensures a clean slate during an update without deleting the parent.
      await connection.query(`DELETE FROM presupuestos_detalle WHERE id_presupuesto = $1`, [id]);

      /* 3️⃣ INSERT NEW DETAILS */
      for (const item of detalle) {
        await connection.query(
          `INSERT INTO presupuestos_detalle (
            id_presupuesto,
            id_inventario,
            cantidad,
            precio_venta,
            cantidad_vendida,
            backorder
          ) VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            id,
            item.id_inventario,
            parseMonto(item.cantidad),
            parseMonto(item.precio_venta),
            item.cantidad_vendida || 0,
            item.backorder || 0
          ]
        );
      }

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Budget updated successfully"
      };

    } catch (error) {

      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error updating budget",
        error: error.message
      };

    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= DELETE (DEACTIVATE) ================= */
  
  static async deleteBudget(id) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      /* 1️⃣ Verify budget exists */
      const budget = await connection.query(
        `SELECT id FROM presupuestos WHERE id = $1`,
        [id]
      );

      if (!budget.rowCount) {
        await connection.query("ROLLBACK");
        return {
          status: false,
          code: 404,
          msg: "Budget not found"
        };
      }

      /* 2️⃣ Change status to false */
      await connection.query(
        `UPDATE presupuestos SET estatus = false WHERE id = $1`,
        [id]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Budget successfully deactivated"
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      return {
        status: false,
        code: 500,
        msg: "Error deactivating budget",
        error: error.message
      };

    } finally {
      if (connection) connection.release();
    }
  }

}