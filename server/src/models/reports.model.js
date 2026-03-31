import pool from "../connection/db.connect.js";

const parseMonto = (valor) => {
  if (!valor) return 0;
  if (typeof valor === "number") return valor;
  return parseFloat(valor.toString().replace(/\./g, "").replace(",", "."));
};

export class ReportsModel {
  /* ================= LIST ================= */
  static async getAllReports() {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT 
          r.id, 
          r.nro_reporte, 
          r.total, 
          r.estatus_uso, 
          r.estatus, 
          r.fecha_creacion,

          p.nombre AS nombre_paciente,

          -- 📦 cantidad de items
          (
            SELECT COUNT(*) 
            FROM reportes_detalle rd 
            WHERE rd.id_reporte = r.id
          ) AS total_items,

          -- 👨‍⚕️ cantidad de personal
          (
            SELECT COUNT(*) 
            FROM reportes_personal rp 
            WHERE rp.id_reporte = r.id
          ) AS total_personal

        FROM reportes r
        LEFT JOIN pacientes p ON p.id = r.id_paciente
        WHERE r.estatus = true
        ORDER BY r.fecha_creacion DESC, r.id DESC
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
        msg: "Error retrieving reports",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= DETAIL ================= */
  static async getReportById(id) {
    let connection;
    try {
      connection = await pool.connect();

      const result = await connection.query(`
        SELECT 
          r.id,
          r.nro_reporte,
          r.total,
          r.estatus_uso,
          r.estatus,
          r.fecha_creacion,

          p.id AS id_paciente,
          p.nombre AS paciente_nombre,

          -- 📦 DETALLE
          (
            SELECT COALESCE(json_agg(det ORDER BY det.id_detalle), '[]'::json)
            FROM (
              SELECT 
                rd.id AS id_detalle,
                rd.id_inventario,

                -- 🧾 PRODUCTO
                prod.id AS id_producto,
                prod.descripcion,

                -- 📦 INVENTARIO COMPLETO
                i.sku,
                i.existencia_general,
                i.costo_unitario,
                i.precio_venta,
                i.margen_ganancia,
                i.stock_minimo_general,
                i.estatus AS inventario_estatus,
                i.estatus_lotes,
                i.fecha_creacion AS inventario_fecha_creacion,

                -- 📊 DETALLE REPORTE
                rd.cantidad,
                rd.backorder

              FROM reportes_detalle rd
              INNER JOIN inventario i ON i.id = rd.id_inventario
              INNER JOIN productos prod ON prod.id = i.id_producto
              WHERE rd.id_reporte = r.id
            ) det
          ) AS detalle,

          -- 👨‍⚕️ PERSONAL
          (
            SELECT COALESCE(json_agg(per ORDER BY per.id_personal), '[]'::json)
            FROM (
              SELECT 
                pers.id AS id_personal,
                m.id AS id_medico,
                m.nombre,
                tm.nombre AS tipo
              FROM reportes_personal rp
              INNER JOIN personal pers ON pers.id = rp.id_personal
              INNER JOIN medicos m ON m.id = pers.id_medico
              LEFT JOIN tipoMedicos tm ON tm.id = m.id_tipoMedico
              WHERE rp.id_reporte = r.id
            ) per
          ) AS personal_asignado

        FROM reportes r
        INNER JOIN pacientes p ON p.id = r.id_paciente
        WHERE r.id = $1
        LIMIT 1
      `, [id]);

      if (!result.rows.length) {
        return {
          status: false,
          code: 404,
          msg: "Reporte no encontrado"
        };
      }

      return {
        status: true,
        code: 200,
        data: result.rows[0]
      };

    } catch (error) {
      console.error("Error en getReportById:", error);

      return {
        status: false,
        code: 500,
        msg: "Error al obtener el reporte",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= CREATE ================= */
  static async createReports(data) {
    let connection;
    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const { 
        id_paciente, 
        id_clinica = null,
        detalle = [], 
        personal_asignado = [] 
      } = data;

      // 🔴 Validaciones básicas
      if (!id_paciente) {
        throw new Error("El id_paciente es obligatorio");
      }

      if (!detalle.length) {
        throw new Error("El reporte debe tener al menos un producto");
      }

      // 1. 🔢 Generar número de reporte (bloqueando para evitar duplicados)
      const lastReportRes = await connection.query(
        `SELECT nro_reporte 
        FROM reportes 
        WHERE nro_reporte LIKE 'REP-%'
        ORDER BY id DESC 
        LIMIT 1
        FOR UPDATE`
      );

      let nextNumber = 1;

      if (lastReportRes.rows.length > 0) {
        const lastNro = lastReportRes.rows[0].nro_reporte;
        const parts = lastNro.split('-');

        if (parts.length > 1 && !isNaN(parts[1])) {
          nextNumber = parseInt(parts[1], 10) + 1;
        }
      }

      const nro_reporte = `REP-${nextNumber.toString().padStart(4, '0')}`;

      // 2. 🧾 Insertar cabecera
      const reportRes = await connection.query(
        `INSERT INTO reportes 
          (id_paciente, id_clinica, nro_reporte, total, estatus_uso) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id`,
        [id_paciente, id_clinica, nro_reporte, 0, 1]
      );

      const idReporte = reportRes.rows[0].id;

      // 3. 📦 Insertar detalle
      for (const item of detalle) {

        if (!item.id_inventario) {
          throw new Error("Todos los items deben tener id_inventario");
        }

        let cantInsumo = item.cantidad;

        if (typeof cantInsumo === "string") {
          cantInsumo = parseFloat(cantInsumo.replace(",", "."));
        }

        cantInsumo = Math.floor(cantInsumo || 0);

        if (cantInsumo <= 0) {
          throw new Error("La cantidad debe ser mayor a 0");
        }

        await connection.query(
          `INSERT INTO reportes_detalle 
            (id_reporte, id_inventario, cantidad, backorder) 
          VALUES ($1, $2, $3, $4)`,
          [idReporte, item.id_inventario, cantInsumo, 0]
        );
      }

      // 4. 👨‍⚕️ Insertar personal (igual que ventas)
      for (const person of personal_asignado) {

        if (!person.id) {
          throw new Error("El personal asignado debe tener id");
        }

        // 🔍 Buscar si ya existe en tabla personal
        const personalRes = await connection.query(
          `SELECT id FROM personal WHERE id_medico = $1 LIMIT 1`,
          [person.id]
        );

        let idPersonal;

        if (personalRes.rows.length) {
          idPersonal = personalRes.rows[0].id;
        } else {
          // 🆕 Crear si no existe
          const newPersonal = await connection.query(
            `INSERT INTO personal (id_medico) VALUES ($1) RETURNING id`,
            [person.id]
          );
          idPersonal = newPersonal.rows[0].id;
        }

        // 🔗 Relacionar con reporte
        await connection.query(
          `INSERT INTO reportes_personal (id_reporte, id_personal)
          VALUES ($1, $2)`,
          [idReporte, idPersonal]
        );
      }

      await connection.query("COMMIT");

      return {
        status: true,
        code: 201,
        msg: "Reporte creado exitosamente",
        data: {
          id: idReporte,
          nro_reporte
        }
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      console.error("Error en createReports:", error);

      return {
        status: false,
        code: 500,
        msg: error.message || "Error al crear el reporte",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= UPDATE ================= */
  static async updateReport(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const { id_paciente, id_clinica, total, detalle, personal } = data;

      // 1. Update Cabecera
      const updateRes = await connection.query(
        `UPDATE reportes SET id_paciente = $1, id_clinica = $2, total = $3 WHERE id = $4`,
        [id_paciente, id_clinica || null, parseMonto(total), id]
      );

      if (updateRes.rowCount === 0) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "Report not found" };
      }

      // 2. Refresh Detalle (Si se envía)
      if (detalle) {
        await connection.query(`DELETE FROM reportes_detalle WHERE id_reporte = $1`, [id]);
        for (const item of detalle) {
          await connection.query(
            `INSERT INTO reportes_detalle (id_reporte, id_inventario, cantidad, backorder) VALUES ($1, $2, $3, $4)`,
            [id, item.id_inventario, parseMonto(item.cantidad), item.backorder || 0]
          );
        }
      }

      // 3. Refresh Personal (Si se envía)
      if (personal) {
        await connection.query(`DELETE FROM reportes_personal WHERE id_reporte = $1`, [id]);
        for (const idPers of personal) {
          await connection.query(
            `INSERT INTO reportes_personal (id_reporte, id_personal) VALUES ($1, $2)`,
            [id, idPers]
          );
        }
      }

      await connection.query("COMMIT");
      return { 
        status: true, 
        code: 200, 
        msg: "Report updated successfully" 
      };
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return { 
        status: false, 
        code: 500, 
        msg: "Error updating report", 
        error: error.message 
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= DELETE (DEACTIVATE) ================= */
  static async deleteReports(id) {
    let connection;
    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const result = await connection.query(
        `UPDATE reportes SET estatus = false WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "Report not found" };
      }

      await connection.query("COMMIT");
      return { 
        status: true, 
        code: 200, 
        msg: "Report successfully deactivated" 
      };
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return { 
        status: false, 
        code: 500, 
        msg: "Error deactivating report", 
        error: error.message 
      };
    } finally {
      if (connection) connection.release();
    }
  }

  /* ================= Use ================= */
  static async useReports(id) {
    let connection;
    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      const result = await connection.query(
        `UPDATE reportes SET estatus_uso = 2 WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        await connection.query("ROLLBACK");
        return { status: false, code: 404, msg: "Report not found" };
      }

      await connection.query("COMMIT");
      return { 
        status: true, 
        code: 200, 
        msg: "Report successfully used" 
      };
    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      return { 
        status: false, 
        code: 500, 
        msg: "Error deactivating report", 
        error: error.message 
      };
    } finally {
      if (connection) connection.release();
    }
  }
}