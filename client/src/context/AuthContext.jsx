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
  deleteUser
} from "../api/auth";

// Context
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
  
  // New state for user management
  const [usersList, setUsersList] = useState([]);

  const signIn = async (userCredentials) => {
    try {
      const res = await loginRequest(userCredentials);
      
      Cookies.set('token', res.data.token, { expires: 7 });
      let userInfo = res.data.data.user;

      localStorage.setItem("UserId", JSON.stringify(userInfo));
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      setErrors([error.response?.data || "Login failed"]);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  // -------------------- User Management Functions --------------------

  const fetchAllUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsersList(res.data.data);
      return res.data;
    } catch (error) {
      setErrors([error.response?.data || "Failed to fetch users"]);
    }
  };

  const fetchUserById = async (id) => {
    try {
      const res = await getUserById(id);
      return res.data.data;
    } catch (error) {
      setErrors([error.response?.data || "Failed to fetch user"]);
    }
  };

  const createNewUser = async (data) => {
    try {
      const res = await createUser(data);
      // Optimistically update the state
      setUsersList([...usersList, res.data]); 
      return res.data;
    } catch (error) {
      setErrors([error.response?.data || "Failed to create user"]);
      throw error;
    }
  };

  const editUser = async (id, data) => {
    try {
      const res = await updateUser(id, data);
      // Update the specific user in the local state array
      setUsersList(usersList.map(u => u.id === id ? res.data : u));
      return res.data;
    } catch (error) {
      setErrors([error.response?.data || "Failed to update user"]);
      throw error;
    }
  };

  const removeUser = async (id) => {
    try {
      await deleteUser(id);
      // Remove the deleted user from the local state
      setUsersList(usersList.filter(u => u.id !== id));
    } catch (error) {
      setErrors([error.response?.data || "Failed to delete user"]);
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
      const cookies = Cookies.get();

      if (!cookies.token) {
        setIsAuthenticated(false);
        setLoading(false);
        return setUser(null);
      }

      try {
        const res = await verifyTokenRequest(cookies.token);
        if (!res.data) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        } 
        
        setIsAuthenticated(true);
        setUser(res.data);
        localStorage.setItem('timeSelect', JSON.stringify(res.data.time_select));
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
      removeUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};