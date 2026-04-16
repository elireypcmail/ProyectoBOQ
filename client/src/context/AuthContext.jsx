// Dependencies
import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from "js-cookie";

// Api
import { 
  loginRequest, 
  verifyTokenRequest,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,      
  createRole,       
  updateRole,       
  deleteRole        
} from "../api/auth";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Authentication states
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User & Role Management states
  const [usersList, setUsersList] = useState([]);
  const [rolesList, setRolesList] = useState([]); 

  const signIn = async (userCredentials) => {
    try {
      const res = await loginRequest(userCredentials);
      Cookies.set('token', res.data.token, { expires: 0.125 });
      let userInfo = res.data.data;

      localStorage.setItem("UserId", JSON.stringify(userInfo));
      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (error) {
      setErrors([error.response?.data?.msg || "Login failed"]);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  // -------------------- User Management (Original) --------------------

  const fetchAllUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsersList(res.data.data);
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Failed to fetch users"]);
    }
  };

  const fetchUserById = async (id) => {
    try {
      const res = await getUserById(id);
      return res.data.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Failed to fetch user"]);
    }
  };

  const createNewUser = async (data) => {
    try {
      const res = await createUser(data);
      setUsersList([...usersList, res.data.data]); 
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Failed to create user"]);
      throw error;
    }
  };

  const editUser = async (id, data) => {
    try {
      const res = await updateUser(id, data);
      setUsersList(usersList.map(u => u.id === id ? res.data.data : u));
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Failed to update user"]);
      throw error;
    }
  };

  const removeUser = async (id) => {
    try {
      await deleteUser(id);
      setUsersList(usersList.filter(u => u.id !== id));
    } catch (error) {
      setErrors([error.response?.data?.msg || "Failed to delete user"]);
    }
  };

  // -------------------- Role Management (Nuevo) --------------------

  const fetchAllRoles = async () => {
    try {
      const res = await getAllRoles();
      setRolesList(res.data.data);
      return res.data.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error al obtener roles"]);
    }
  };

  const createNewRole = async (data) => {
    try {
      const res = await createRole(data);
      setRolesList([...rolesList, res.data.data]);
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error al crear rol"]);
      throw error;
    }
  };

  const editRole = async (id, data) => {
    try {
      const res = await updateRole(id, data);
      setRolesList(rolesList.map(r => r.id === id ? res.data.data : r));
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error al actualizar rol"]);
      throw error;
    }
  };

  const removeRole = async (id) => {
    try {
      await deleteRole(id);
      setRolesList(rolesList.filter(r => r.id !== id));
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error al eliminar rol"]);
      throw error;
    }
  };

  // -------------------- Effects --------------------

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    const checkLogin = async () => {
      const token = Cookies.get('token');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return setUser(null);
      }

      try {
        const res = await verifyTokenRequest();
        if (!res.data) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        } 
        
        setIsAuthenticated(true);
        setUser(res.data.user);
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{
      // Auth
      signIn,
      logout,
      loading,
      user,
      isAuthenticated,
      errors,
      
      // User Management
      usersList,
      fetchAllUsers,
      fetchUserById,
      createNewUser,
      editUser,
      removeUser,

      // Role Management
      rolesList,
      fetchAllRoles,
      createNewRole,
      editRole,
      removeRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};