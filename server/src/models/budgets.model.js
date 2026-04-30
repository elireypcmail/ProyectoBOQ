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

      // Nota: Eliminé p.estado_pago porque no existe en tu CREATE TABLE original.
      // Si la agregaste después, puedes volver a incluirla.
      const result = await connection.query(`
        SELECT 
          p.id,
          p.id_paciente,
          p.id_clinica,
          p.id_seguro,
          p.nro_presupuesto,
          p.total,
          p.estatus_uso,
          p.estatus,
          p.fecha_creacion,
          
          -- Datos Relacionados con alias claros
          pac.nombre AS nombre_paciente,
          c.nombre AS nombre_clinica,
          s.nombre AS nombre_seguro
        FROM presupuestos p
        LEFT JOIN pacientes pac ON pac.id = p.id_paciente
        LEFT JOIN clinicas c ON c.id = p.id_clinica
        LEFT JOIN seguros s ON s.id = p.id_seguro
        WHERE p.estatus = true
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
          p.particular,
          p.nro_presupuesto,
          p.estatus,
          p.estatus_uso,
          p.tasa_bs,
          p.total,
          p.notas,
          p.fecha_creacion,

          -- 👤 PACIENTE
          p.id_paciente,
          pac.nombre AS paciente_nombre,
          pac.documento AS paciente_documento,
          
          -- 🏥 CLINICA Y SEGURO
          p.id_clinica,
          c.nombre AS clinica_nombre,
          p.id_seguro,
          s.nombre AS seguro_nombre,

          -- 👨‍⚕️ MÉDICO TRATANTE (Ajustado)
          p.id_medico,
          m.nombre AS medico_nombre,
          tm.nombre AS medico_tipo,

          -- 👤 USUARIO (Quién realizó el presupuesto)
          (
            SELECT u.nombre 
            FROM auditoria a
            INNER JOIN usuarios u ON u.id = a.usuario_id
            WHERE a.id_entidad = p.id 
              AND a.entidad = 'presupuestos' 
              AND a.accion = 'CREAR PRESUPUESTO' -- Ajustar según el nombre exacto en tu tabla auditoria
            LIMIT 1
          ) AS realizado_por,

          -- 📦 DETALLE
          (
            SELECT COALESCE(json_agg(
              json_build_object(
                'id_detalle', pd.id,
                'id_inventario', pd.id_inventario,
                'id_producto', i.id_producto,
                'descripcion', pr.descripcion,
                'sku', i.sku,
                'cantidad', pd.cantidad,
                'precio_venta', pd.precio_venta,
                'cantidad_vendida', pd.cantidad_vendida,
                'backorder', pd.backorder
              )
            ), '[]'::json)
            FROM presupuestos_detalle pd
            INNER JOIN inventario i ON i.id = pd.id_inventario
            INNER JOIN productos pr ON pr.id = i.id_producto
            WHERE pd.id_presupuesto = p.id
          ) AS detalle

        FROM presupuestos p
        LEFT JOIN pacientes pac ON pac.id = p.id_paciente
        LEFT JOIN clinicas c ON c.id = p.id_clinica
        LEFT JOIN seguros s ON s.id = p.id_seguro
        LEFT JOIN medicos m ON m.id = p.id_medico            -- Relación con médicos
        LEFT JOIN tipoMedicos tm ON tm.id = m.id_tipoMedico -- Relación con tipo de médico
        WHERE p.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return { 
          status: false, 
          code: 404, 
          msg: "Presupuesto no encontrado" 
        };
      }

      return {
        status: true,
        code: 200,
        data: result.rows[0]
      };

    } catch (error) {
      console.error("Error en getBudgetById:", error);
      return {
        status: false,
        code: 500,
        msg: "Error al obtener el presupuesto",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= CREATE BUDGET ================= */

  static async createBudgets(data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const {
        id_paciente,
        cliente,
        id_clinica,
        id_seguro,
        id_medico, // <--- 1. Extraemos el id_medico de la data
        particular,
        detalle = [],
        total,
        notas,
        estado_pago
      } = data;

      const targetPatient = id_paciente || cliente;

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
          id_medico,     -- <--- 2. Agregamos la columna en el INSERT
          particular,
          nro_presupuesto,
          total,
          notas,
          estatus_uso,
          estatus
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) -- <--- 3. Aumentamos a 10 placeholders
        RETURNING id`,
        [
          targetPatient,
          id_clinica || null,
          id_seguro || null,
          id_medico || null,  // <--- 4. Pasamos el valor al arreglo
          particular || false,
          nroPresupuesto,
          parseMonto(total),
          notas || null,
          1,
          true,
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
        id_medico, // <--- 1. Extraemos id_medico
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
          id_medico = $4,
          total = $5,
          estado_pago = $6
        WHERE id = $7`
        [
          targetPatient,
          id_clinica || null,
          id_seguro || null,
          id_medico || null, // <--- 4. Pasamos el valor
          parseMonto(total),
          formattedEstadoPago,
          id
        ]
      );

      /* 2️⃣ CLEAN OLD DETAILS */
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

  /* ================= USE BUDGET ================= */
  
  static async useBudgets(id) {
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
        `UPDATE presupuestos SET estatus_uso = 2 WHERE id = $1`,
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
  /* ================= EXPORT BUDGET ================= */
  
  static async exportBudgets(id, data) {
    let connection;

    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const { tasa, id_usuario } = data;

      /* 1️⃣ Obtener datos actuales para la auditoría y verificar existencia */
      const budgetRes = await connection.query(
        `SELECT id, estatus_uso, tasa_bs FROM presupuestos WHERE id = $1`,
        [id]
      );

      if (budgetRes.rowCount === 0) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "Presupuesto no encontrado" };
      }

      const oldData = budgetRes.rows[0];

      /* 2️⃣ Actualizar estatus y registrar la tasa de cambio */
      // Ajusta 'tasa_bs' al nombre real de tu columna (ej: tasa_bcov, tasa_dia)
      const updateRes = await connection.query(
        `UPDATE presupuestos 
        SET estatus_uso = 2, 
            tasa_bs = $1 
        WHERE id = $2 
        RETURNING *`,
        [tasa, id]
      );

      const newData = updateRes.rows[0];

      /* 3️⃣ Registrar en Auditoría */
      await connection.query(
        `INSERT INTO auditoria (
          entidad, 
          id_entidad, 
          accion, 
          datos_previos, 
          datos_nuevos, 
          usuario_id, 
          fecha
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          'presupuestos',
          id,
          'EXPORTAR PDF Y ACTUALIZAR TASA',
          JSON.stringify(oldData), // Lo que había antes
          JSON.stringify({ 
            estatus_uso: 2, 
            tasa_bs: tasa 
          }), // Lo que se cambió
          id_usuario
        ]
      );

      await connection.query("COMMIT");

      return {
        status: true,
        code: 200,
        msg: "Presupuesto exportado y auditado exitosamente",
        data: newData
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      console.error("Error en exportBudgets:", error);
      return {
        status: false,
        code: 500,
        msg: "Error al procesar la exportación del presupuesto",
        error: error.message
      };

    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= DELETE (DEACTIVATE) ================= */
  
  static async deleteBudgets(id) {
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