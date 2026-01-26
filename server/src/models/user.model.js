// Dependencies
import pool from "../connection/db.connect.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createAccessToken } from "../libs/jwt.js"
import _var from "../global/_var.js"

export class Users {

  // =============================
  // CREATE USER
  // =============================
  static async create(data) {
    let connection

    try {
      connection = await pool.connect()

      const {
        nombre,
        email,
        contrasena,
        rol,
        id_oficina = null,
        id_deposito = null,
        telefono = null
      } = data

      // Verificar email
      const verify = await connection.query(
        "SELECT email FROM usuarios WHERE email = $1",
        [email]
      )

      if (verify.rows.length > 0) {
        return {
          status: false,
          msg: "El usuario ya existe",
          code: 409
        }
      }

      const hashedPassword = await bcrypt.hash(contrasena, 10)

      const insert = await connection.query(
        `
        INSERT INTO usuarios
        (nombre, email, contrasena, rol, id_oficina, id_deposito, telefono)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, nombre, email, rol, estatus, fecha_creacion
        `,
        [nombre, email, hashedPassword, rol, id_oficina, id_deposito, telefono]
      )

      return {
        status: true,
        msg: "Usuario registrado correctamente",
        code: 201,
        data: insert.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        msg: "Error al crear usuario",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  // =============================
  // LOGIN / VERIFY USER
  // =============================
  static async verify(email, contrasena) {
    let connection

    try {
      connection = await pool.connect()

      const result = await connection.query(
        `
        SELECT id, nombre, email, contrasena, rol, estatus
        FROM usuarios
        WHERE email = $1
        `,
        [email]
      )

      if (result.rows.length === 0) {
        return {
          status: false,
          msg: "Usuario o contraseña incorrectos",
          code: 404
        }
      }

      const user = result.rows[0]

      if (!user.estatus) {
        return {
          status: false,
          msg: "Usuario inactivo",
          code: 403
        }
      }

      const isMatch = await bcrypt.compare(contrasena, user.contrasena)

      if (!isMatch) {
        return {
          status: false,
          msg: "Usuario o contraseña incorrectos",
          code: 401
        }
      }

      const token = await createAccessToken({
        id_user: user.id,
        email: user.email,
        rol: user.rol
      })

      return {
        status: true,
        msg: "Login exitoso",
        code: 200,
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      }

    } catch (error) {
      return {
        status: false,
        msg: "Error interno",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  // =============================
  // VERIFY TOKEN
  // =============================
  static async verifyToken(token) {
    let connection

    try {
      const decoded = jwt.verify(token, _var.JWT)

      connection = await pool.connect()

      const result = await connection.query(
        `
        SELECT id, email, rol, estatus
        FROM usuarios
        WHERE id = $1
        `,
        [decoded.id_user]
      )

      if (result.rows.length === 0) {
        return {
          status: false,
          msg: "Token inválido",
          code: 401
        }
      }

      return {
        status: true,
        msg: "Token autorizado",
        code: 200,
        user: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        msg: "Token no válido",
        code: 401,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }
}
