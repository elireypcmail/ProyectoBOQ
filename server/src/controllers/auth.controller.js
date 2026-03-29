// Models
import { Users } from "../models/user.model.js";

export const controller = {};

/* ================= LOGIN ================= */
controller.login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({
        status: false,
        msg: "Email y contraseña son requeridos",
      });
    }

    const user = await Users.verify(email, contrasena);
    console.log(user)


    if (!user || user.code !== 200) {
      return res.status(401).json({
        status: false,
        msg: user?.msg || "Credenciales inválidas",
      });
    }

    res.cookie("token", user.tokenUser, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      status: true,
      msg: "Login exitoso",
      data: user.data || user,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno del servidor",
      error: error.message,
    });
  }
};

/* ================= REGISTER ================= */
controller.register = async (req, res) => {
  try {
    const data = req.body;

    if (!data.email || !data.contrasena) {
      return res.status(400).json({
        status: false,
        msg: "Email y contraseña son requeridos",
      });
    }

    console.log(data)

    const user = await Users.create(data);
    console.log(user)
    if (user.code !== 201) {
      return res.status(400).json({
        status: false,
        msg: user.msg || "No se pudo registrar el usuario",
      });
    }

    return res.status(201).json({
      status: true,
      msg: "Usuario creado correctamente",
      data: user.data || user,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      status: false,
      msg: "Error interno del servidor",
      error: error.message,
    });
  }
};

/* ================= GET ALL ================= */
controller.getAllUsers = async (req, res) => {
  try {
    const response = await Users.getAll();

    return res.status(response.code).json({
      status: response.status,
      msg: response.msg || "Usuarios obtenidos",
      data: response.data || [],
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({
      status: false,
      msg: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

/* ================= GET USER BY ID ================= */
controller.getAllUsersById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await Users.getById(id);

    return res.status(response.code).json({
      status: response.status,
      msg: response.msg || "Usuario obtenido",
      data: response.data || [],
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({
      status: false,
      msg: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

/* ================= UPDATE ================= */
controller.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      return res.status(400).json({
        status: false,
        msg: "ID requerido",
      });
    }

    const response = await Users.update(id, data);

    return res.status(response.code).json({
      status: response.status,
      msg: response.msg,
      data: response.data || null,
    });

  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return res.status(500).json({
      status: false,
      msg: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

/* ================= STATUS ================= */
controller.setStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        msg: "ID es requerido",
      });
    }

    const response = await Users.changeStatus(id);

    return res.status(response.code).json({
      status: response.status,
      msg: response.msg,
    });

  } catch (error) {
    console.error("STATUS USER ERROR:", error);
    return res.status(500).json({
      status: false,
      msg: "Error al cambiar estatus",
      error: error.message,
    });
  }
};

/* ================= LOGOUT ================= */
controller.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      status: true,
      msg: "Sesión cerrada",
    });

  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return res.status(500).json({
      status: false,
      msg: "Error al cerrar sesión",
      error: error.message,
    });
  }
};

/* ================= VERIFY TOKEN ================= */
controller.verifyToken = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        status: false,
        msg: "Token no autorizado",
      });
    }

    const user = await Users.verifyToken(token);

    return res.status(200).json({
      status: true,
      data: user,
    });

  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error);
    return res.status(500).json({
      status: false,
      msg: "Error al verificar token",
      error: error.message,
    });
  }
};