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
      
      // We join the tables to get the role name from the 'roles' table
      const query = `
        SELECT 
          u.id, 
          u.nombre, 
          u.email, 
          u.estatus, 
          u.telefono, 
          u.id_oficina, 
          u.id_deposito, 
          u.fecha_creacion,
          r.nombre AS rol
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
        LEFT JOIN roles r ON ur.rol_id = r.id
        ORDER BY u.id ASC
      `;

      const result = await connection.query(query);

      if (result.rows.length === 0) {
        return { status: false, msg: "No se encontraron usuarios", code: 404 };
      }

      return { status: true, data: result.rows, code: 200 };
    } catch (error) {
      console.error("GET ALL USERS ERROR:", error);
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
        `
        SELECT 
          u.id,
          u.nombre,
          u.email,
          u.telefono,
          u.estatus,
          u.id_oficina,
          u.id_deposito,
          u.fecha_creacion,

          -- ✅ SOLO UN ROL
          MAX(r.nombre) AS rol,

          -- ✅ PERMISOS (array)
          COALESCE(
            json_agg(DISTINCT p.nombre) 
            FILTER (WHERE p.id IS NOT NULL),
            '[]'
          ) AS permisos,

          -- ✅ FIRMA / IMÁGENES
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', ui.id,
                  'data', encode(ui.data, 'base64'),
                  'mime_type', ui.mime_type,
                  'nombre_file', ui.nombre_file,
                  'is_main', ui.is_main
                )
              )
              FROM usuarios_firmas ui
              WHERE ui.user_id = u.id
            ), 
            '[]'
          ) AS images

        FROM usuarios u
        LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
        LEFT JOIN roles r ON r.id = ur.rol_id
        LEFT JOIN usuario_permisos up ON up.usuario_id = u.id
        LEFT JOIN permisos p ON p.id = up.permiso_id

        WHERE u.id = $1
        GROUP BY u.id
        `,
        [id]
      );
      
      if (result.rows.length === 0) {
        return { status: false, msg: "No se encontró el usuario", code: 404 };
      }

      return { status: true, data: result.rows[0], code: 200 };

    } catch (error) {
      console.error("GET BY ID ERROR:", error);
      return {
        status: false,
        msg: "Error de servidor",
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- EDITAR USUARIO ---
  static async update(id, data) {
    let connection;
    try {
      connection = await pool.connect();
      const { nombre, email, contrasena, id_rol, telefono, id_oficina, id_deposito } = data;

      // 1. Iniciar Transacción
      await connection.query("BEGIN");

      // 2. Validar email duplicado (si se intenta cambiar)
      if (email) {
        const verifyEmail = await connection.query(
          "SELECT id FROM usuarios WHERE email = $1 AND id <> $2",
          [email, id]
        );
        if (verifyEmail.rows.length > 0) {
          await connection.query("ROLLBACK");
          return { status: false, msg: "El email ya está en uso", code: 409 };
        }
      }

      const fields = [];
      const values = [];
      let index = 1;

      // Construcción dinámica para la tabla 'usuarios'
      const addField = (field, value) => {
        if (value !== undefined) {
          fields.push(`${field} = $${index++}`);
          values.push(value);
        }
      };

      addField("nombre", nombre);
      addField("email", email);
      addField("telefono", telefono);
      addField("id_oficina", id_oficina);
      addField("id_deposito", id_deposito);

      if (contrasena) {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        fields.push(`contrasena = $${index++}`);
        values.push(hashedPassword);
      }

      // 3. Actualizar tabla 'usuarios' (si hay campos)
      let userUpdated = null;
      if (fields.length > 0) {
        values.push(id);
        const query = `
          UPDATE usuarios 
          SET ${fields.join(", ")} 
          WHERE id = $${index} 
          RETURNING id, nombre, email, telefono, id_oficina, id_deposito
        `;
        const result = await connection.query(query, values);
        
        if (result.rowCount === 0) {
          await connection.query("ROLLBACK");
          return { status: false, msg: "Usuario no encontrado", code: 404 };
        }
        userUpdated = result.rows[0];
      }

      // 4. Actualizar tabla 'usuario_roles' (si viene id_rol)
      if (id_rol !== undefined) {
        // Primero eliminamos el rol anterior para evitar duplicados o conflictos
        await connection.query("DELETE FROM usuario_roles WHERE usuario_id = $1", [id]);
        
        // Insertamos el nuevo rol
        await connection.query(
          "INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)",
          [id, id_rol]
        );
      }

      // 5. Finalizar Transacción
      await connection.query("COMMIT");

      return { 
        status: true, 
        msg: "Usuario actualizado correctamente", 
        data: userUpdated || { id }, 
        code: 200 
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      console.error("UPDATE USER ERROR:", error);
      return { status: false, msg: "Error al actualizar usuario", code: 500, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- DESACTIVAR / ACTIVAR (Toggle) ---
  static async changeStatus(id) {
    let connection;
    try {
      connection = await pool.connect();
      // Cambia el estatus al opuesto del que tenga actualmente
      const result = await connection.query(
        "UPDATE usuarios SET estatus = NOT estatus WHERE id = $2 RETURNING id, estatus",
        [id]
      );

      if (result.rowCount === 0) {
        return { status: false, msg: "El ID de usuario no existe", code: 404 };
      }

      return { 
        status: true, 
        msg: `Usuario ${result.rows[0].estatus ? 'activado' : 'desactivado'}`, 
        code: 200, 
        data: result.rows[0] 
      };
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

      const {
        nombre,
        email,
        contrasena,
        roles = [],              // 🔥 múltiples roles
        permisos = [],           // 🔥 permisos directos (opcional)
        id_oficina = null,
        id_deposito = null,
        telefono = null
      } = data;

      await connection.query("BEGIN");

      // 🔍 1. Verificar email
      const verify = await connection.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [email]
      );

      if (verify.rows.length > 0) {
        await connection.query("ROLLBACK");
        return { status: false, msg: "El usuario ya existe", code: 409 };
      }

      // 🔐 2. Hash password
      const hashedPassword = await bcrypt.hash(contrasena.toUpperCase(), 10);

      // 👤 3. Crear usuario
      const userResult = await connection.query(
        `INSERT INTO usuarios (nombre, email, contrasena, id_oficina, id_deposito, telefono)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, nombre, email, estatus, fecha_creacion`,
        [nombre, email, hashedPassword, id_oficina, id_deposito, telefono]
      );

      const userId = userResult.rows[0].id;

      // 🧑‍💼 4. Validar roles (opcional pero recomendado)
      if (roles.length > 0) {
        const rolesValid = await connection.query(
          "SELECT id FROM roles WHERE id = ANY($1)",
          [roles]
        );

        if (rolesValid.rows.length !== roles.length) {
          await connection.query("ROLLBACK");
          return { status: false, msg: "Uno o más roles no existen", code: 400 };
        }

        // 🔗 insertar roles
        for (const rol_id of roles) {
          await connection.query(
            `INSERT INTO usuario_roles (usuario_id, rol_id)
            VALUES ($1, $2)`,
            [userId, rol_id]
          );
        }
      }

      // 🔐 5. Permisos directos (usuario_permisos)
      if (permisos.length > 0) {
        const permisosValid = await connection.query(
          "SELECT id FROM permisos WHERE id = ANY($1)",
          [permisos]
        );

        if (permisosValid.rows.length !== permisos.length) {
          await connection.query("ROLLBACK");
          return { status: false, msg: "Uno o más permisos no existen", code: 400 };
        }

        for (const permiso_id of permisos) {
          await connection.query(
            `INSERT INTO usuario_permisos (usuario_id, permiso_id)
            VALUES ($1, $2)`,
            [userId, permiso_id]
          );
        }
      }

      await connection.query("COMMIT");

      return {
        status: true,
        msg: "Usuario creado correctamente",
        code: 201,
        data: {
          ...userResult.rows[0],
          roles,
          permisos
        }
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");

      console.error("CREATE USER ERROR:", error);

      return {
        status: false,
        msg: "Error al crear usuario",
        code: 500,
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- GUARDAR FIRMA ---
  static async saveImgSignature(id_user, file) {
    let connection;
    try {
      connection = await pool.connect();
      await connection.query("BEGIN");

      // 1. Eliminamos la firma anterior para que el usuario solo tenga una activa
      await connection.query("DELETE FROM usuarios_firmas WHERE user_id = $1", [id_user]);

      // 2. Insertamos la nueva firma
      const sqlInsert = `
        INSERT INTO usuarios_firmas (user_id, nombre_file, data, mime_type, is_main)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nombre_file;
      `;

      const values = [
        id_user,
        file.originalname,
        file.buffer,
        file.mimetype,
        true // Al ser única, siempre es la principal
      ];

      const result = await connection.query(sqlInsert, values);
      await connection.query("COMMIT");

      return {
        status: true,
        msg: "Firma actualizada",
        data: result.rows[0]
      };

    } catch (error) {
      if (connection) await connection.query("ROLLBACK");
      console.error("❌ Error en saveImgSignature:", error);
      return {
        status: false,
        msg: "Error al guardar la firma en DB",
        error: error.message
      };
    } finally {
      if (connection) connection.release();
    }
  }

  // --- LOGIN / VERIFICAR ---
  static async verify(email, contrasena) {
    let connection;
    try {
      connection = await pool.connect();
      
      // Ajustamos la consulta para traer el nombre del rol desde la tabla roles
      const query = `
        SELECT 
          u.id, u.nombre, u.email, u.contrasena, u.estatus,
          r.nombre AS rol_nombre
        FROM usuarios u
        LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
        LEFT JOIN roles r ON ur.rol_id = r.id
        WHERE u.email = $1
      `;
      
      const result = await connection.query(query, [email]);

      if (result.rows.length === 0) {
        return { status: false, msg: "Usuario no encontrado", code: 404 };
      }

      const user = result.rows[0];

      // Verificar si el usuario está activo
      if (!user.estatus) {
        return { status: false, msg: "Usuario inactivo", code: 403 };
      }

      // Comparar contraseña
      const isMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (!isMatch) {
        return { status: false, msg: "Contraseña incorrecta", code: 401 };
      }

      // Generar token incluyendo el nombre del rol obtenido del JOIN
      const token = await createAccessToken({ 
        id_user: user.id, 
        email: user.email, 
        rol: user.rol_nombre // Usamos el alias del JOIN
      });

      return {
        status: true,
        msg: "Login exitoso",
        code: 200,
        token,
        user: { 
          id: user.id, 
          nombre: user.nombre, 
          email: user.email, 
          rol: user.rol_nombre 
        },
      };
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return { status: false, msg: "Error interno del servidor", code: 500, error: error.message };
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
        "SELECT id, nombre, email, rol, estatus FROM usuarios WHERE id = $1",
        [decoded.id_user]
      );

      if (result.rows.length === 0) {
        return { status: false, msg: "Token no corresponde a ningún usuario", code: 404 };
      }

      return { status: true, msg: "Token autorizado", code: 200, user: result.rows[0] };
    } catch (error) {
      return { status: false, msg: "Token no válido", code: 401, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }
}