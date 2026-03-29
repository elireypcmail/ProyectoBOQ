// Dependencies
import pool from "../connection/db.connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createAccessToken } from "../libs/jwt.js";
import _var from "../global/_var.js";

export class Users {

  // --- OBTENER TODOS LOS USUARIOS ---
  static async getAll() {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        "SELECT id, nombre, email, rol, estatus, telefono, id_oficina, id_deposito, fecha_creacion FROM usuarios ORDER BY id ASC",
      );

      let response = { status: false, msg: "No se encontraron usuarios", code: 404 };

      if (result.rows.length > 0) {
        response = { status: true, data: result.rows, code: 200 };
      }

      return response;
    } catch (error) {
      return { status: false, msg: "Error de servidor", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- OBTENER USUARIO POR ID ---
  static async getById(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        "SELECT id, nombre, email, rol, estatus, telefono, id_oficina, id_deposito, fecha_creacion FROM usuarios WHERE id = $1",
        [id]
      );

      let response = { status: false, msg: "No se encontró el usuario", code: 404 };

      if (result.rows.length > 0) {
        response = { status: true, data: result.rows, code: 200 };
      }

      return response;
    } catch (error) {
      return { status: false, msg: "Error de servidor", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- EDITAR USUARIO ---
  static async update(id, data) {
    let connection;
    try {
      connection = await pool.connect();

      const {
        nombre,
        email,
        contrasena,
        rol,
        telefono,
        id_oficina,
        id_deposito
      } = data;

      // 🔒 Validar email duplicado (si viene)
      if (email) {
        const verifyEmail = await connection.query(
          "SELECT id FROM usuarios WHERE email = $1 AND id <> $2",
          [email, id]
        );

        if (verifyEmail.rows.length > 0) {
          return {
            status: false,
            msg: "El email ya está en uso",
            code: 409
          };
        }
      }

      // 🧠 Construcción dinámica del UPDATE
      const fields = [];
      const values = [];
      let index = 1;

      if (nombre !== undefined) {
        fields.push(`nombre = $${index++}`);
        values.push(nombre);
      }

      if (email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(email);
      }

      if (rol !== undefined) {
        fields.push(`rol = $${index++}`);
        values.push(rol);
      }

      if (telefono !== undefined) {
        fields.push(`telefono = $${index++}`);
        values.push(telefono);
      }

      if (id_oficina !== undefined) {
        fields.push(`id_oficina = $${index++}`);
        values.push(id_oficina);
      }

      if (id_deposito !== undefined) {
        fields.push(`id_deposito = $${index++}`);
        values.push(id_deposito);
      }

      // 🔐 PASSWORD (solo si viene)
      if (contrasena) {
        const hashedPassword = await bcrypt.hash(contrasena.toUpperCase(), 10);
        fields.push(`contrasena = $${index++}`);
        values.push(hashedPassword);
      }

      // ❌ Si no mandaron nada
      if (fields.length === 0) {
        return {
          status: false,
          msg: "No hay datos para actualizar",
          code: 400
        };
      }

      // 📌 ID al final
      values.push(id);

      const query = `
        UPDATE usuarios
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING id, nombre, email, rol, telefono, id_oficina, id_deposito
      `;

      const result = await connection.query(query, values);

      if (result.rowCount === 0) {
        return {
          status: false,
          msg: "Usuario no encontrado",
          code: 404
        };
      }

      return {
        status: true,
        msg: "Usuario actualizado correctamente",
        data: result.rows[0],
        code: 200
      };

    } catch (error) {
      console.error("UPDATE USER ERROR:", error);

      return {
        status: false,
        msg: "Error al actualizar usuario",
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- DESACTIVAR / ACTIVAR ---
  static async changeStatus(id) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        "UPDATE usuarios SET estatus = $1 WHERE id = $2 RETURNING id, estatus",
        [false, id],
      );

      let response = { status: false, msg: "El ID de usuario no existe", code: 404 };

      if (result.rowCount > 0) {
        response = { 
          status: true, 
          msg: "Usuario desactivado", 
          code: 200, 
          data: result.rows[0] 
        };
      }

      return response;
    } catch (error) {
      return { status: false, msg: "Error al cambiar el estatus", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- CREAR USUARIO ---
  static async create(data) {
    let connection;
    try {
      connection = await pool.connect();
      const { nombre, email, contrasena, rol, id_oficina = null, id_deposito = null, telefono = null } = data;

      const verify = await connection.query("SELECT email FROM usuarios WHERE email = $1", [email]);

      if (verify.rows.length > 0) {
        return { status: false, msg: "El usuario ya existe", code: 409 };
      }

      const hashedPassword = await bcrypt.hash(contrasena.toUpperCase(), 10);
      const insert = await connection.query(
        `INSERT INTO usuarios (nombre, email, contrasena, rol, id_oficina, id_deposito, telefono)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, nombre, email, rol, estatus, fecha_creacion`,
        [nombre, email, hashedPassword, rol, id_oficina, id_deposito, telefono],
      );

      return { status: true, msg: "Usuario registrado correctamente", code: 201, data: insert.rows[0] };
    } catch (error) {
      return { status: false, msg: "Error al crear usuario", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- LOGIN / VERIFICAR USUARIO ---
  static async verify(email, contrasena) {
    let connection;
    try {
      connection = await pool.connect();
      const result = await connection.query(
        "SELECT id, nombre, email, contrasena, rol, estatus FROM usuarios WHERE email = $1",
        [email],
      );

      let response = { status: false, msg: "Usuario no encontrado", code: 404 };

      if (result.rows.length > 0) {
        const user = result.rows[0];

        if (!user.estatus) return { status: false, msg: "Usuario inactivo", code: 403 };

        const isMatch = await bcrypt.compare(contrasena.toUpperCase(), user.contrasena);
        // const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        console.log(isMatch)

        if (!isMatch) return { status: false, msg: "Contraseña incorrecta", code: 401 };

        const token = await createAccessToken({ id_user: user.id, email: user.email, rol: user.rol });

        response = {
          status: true,
          msg: "Login exitoso",
          code: 200,
          token,
          user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
        };
      }

      return response;
    } catch (error) {
      return { status: false, msg: "Error interno", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- VERIFICAR TOKEN ---
  static async verifyToken(token) {
    let connection;
    try {
      const decoded = jwt.verify(token, _var.JWT);
      connection = await pool.connect();

      const result = await connection.query(
        "SELECT id, email, rol, estatus FROM usuarios WHERE id = $1",
        [decoded.id_user],
      );

      let response = { status: false, msg: "Token no corresponde a ningún usuario", code: 404 };

      if (result.rows.length > 0) {
        response = { status: true, msg: "Token autorizado", code: 200, user: result.rows[0] };
      }

      return response;
    } catch (error) {
      return { status: false, msg: "Token no válido", code: 401, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }
}