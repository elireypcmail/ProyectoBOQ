import { Users } from "../models/user.model.js";
import { Roles } from "../models/roles.model.js"; // Importamos el modelo de roles que separamos

export const controller = {};

/* ================= AUTH / LOGIN ================= */
controller.login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ status: false, msg: "Email y contraseña son requeridos" });
    }

    const user = await Users.verify(email, contrasena);
    console.log(user)

    if (!user || user.code !== 200) {
      return res.status(401).json({ status: false, msg: user?.msg || "Credenciales inválidas" });
    }

    // Corregido: el modelo retorna 'token', no 'tokenUser'
    res.cookie("token", user.token, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      status: true,
      msg: "Login exitoso",
      data: user.user,
    });
    
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error interno del servidor", error: error.message });
  }
};

controller.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return res.status(200).json({ status: true, msg: "Sesión cerrada" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al cerrar sesión", error: error.message });
  }
};

controller.verifyToken = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ status: false, msg: "Token no autorizado" });
    }
    const user = await Users.verifyToken(token);
    return res.status(user.code).json(user);
  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error al verificar token", error: error.message });
  }
};

/* ================= USUARIOS ================= */
controller.register = async (req, res) => {
  try {
    const data = req.body;
    if (!data.email || !data.contrasena) {
      return res.status(400).json({ status: false, msg: "Email y contraseña son requeridos" });
    }

    const user = await Users.create(data);
    if (user.code !== 201) {
      return res.status(user.code || 400).json({ status: false, msg: user.msg || "No se pudo registrar el usuario" });
    }

    return res.status(201).json({ status: true, msg: "Usuario creado correctamente", data: user.data });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ status: false, msg: "Error interno del servidor", error: error.message });
  }
};

controller.getAllUsers = async (req, res) => {
  try {
    const response = await Users.getAll();
    return res.status(response.code).json(response);
  } catch (error) {
    return res.status(500).json({ status: false, msg: "Error al obtener usuarios", error: error.message });
  }
};

// Corregido: El nombre ahora coincide con la ruta (getUserById)
controller.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await Users.getById(id);
    return res.status(response.code).json(response);
  } catch (error) {
    return res.status(500).json({ status: false, msg: "Error al obtener usuario", error: error.message });
  }
};

controller.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ status: false, msg: "ID requerido" });

    const response = await Users.update(id, data);
    return res.status(response.code).json(response);
  } catch (error) {
    return res.status(500).json({ status: false, msg: "Error al actualizar usuario", error: error.message });
  }
};

controller.setStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: false, msg: "ID es requerido" });

    const response = await Users.changeStatus(id);
    return res.status(response.code).json(response);
  } catch (error) {
    return res.status(500).json({ status: false, msg: "Error al cambiar estatus", error: error.message });
  }
};

/* ================= ROLES ================= */
controller.registerRole = async (req, res) => {
  try {
    const data = req.body;
    if (!data.nombre) {
      return res.status(400).json({ status: false, msg: "El nombre es requerido" });
    }

    const role = await Roles.create(data); // Ahora usa el modelo correcto
    return res.status(role.code).json(role);
  } catch (error) {
    return res.status(500).json({ status: false, msg: "Error interno del servidor", error: error.message });
  }
};

controller.getAllRoles = async (req, res) => {
  try {
    const response = await Roles.getAll();
    return res.status(response.code).json(response);
  } catch (error) {
    return res.status(500).json({ status: false, msg: "Error al obtener roles", error: error.message });
  }
};

controller.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!id) return res.status(400).json({ status: false, msg: "ID requerido" });

    const response = await Roles.update(id, data);
    return res.status(response.code).json(response);
  } catch (error) {
    return res.status(500).json({ status: false, msg: "Error al actualizar rol", error: error.message });
  }
};

controller.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: false, msg: "ID es requerido" });

    const response = await Roles.delete(id);
    return res.status(response.code).json(response);
  } catch (error) {
    return res.status(500).json({ status: false, msg: "Error al eliminar rol", error: error.message });
  }
};