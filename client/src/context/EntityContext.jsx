// Dependencies
import React, { createContext, useState, useContext } from "react";
import Cookies from "js-cookie";
// API genérica
import { 
  getEntities, 
  createEntity, 
  editEntity, 
  deleteEntity 
} from "../api/entities.js";

// Context
export const EntityContext = createContext();

export const useEntity = () => {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useEntity must be used within an EntityProvider");
  }
  return context;
};

export const EntityProvider = ({ children }) => {
  const [entities, setEntities] = useState({
    offices: [],
    zones: [],
    deposits: [],
    parameters: []
  });
  const [errors, setErrors] = useState([]);

  const getAllEntities = async (table) => {
    try {
      const res = await getEntities(table);

      // 🔹 Asegurarnos de que los datos vengan como array
      const data = res.data?.data || [];

      // 🔹 Guardar en el estado de manera dinámica
      setEntities(prev => ({
        ...prev,
        [table]: Array.isArray(data) ? data : []
      }));

      console.log(data)

      return { status: true, data: data };
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);

      // 🔹 Guardar los errores en el estado
      setErrors(prev => [
        ...prev,
        error.response?.data || `Error fetching ${table}`
      ]);

      return { status: false, error: error.response?.data || error.message };
    }
  };

  const createNewEntity = async (table, newEntity) => {
    try {
      const res = await createEntity(table, newEntity);
      const created = res.data.data;
      setEntities(prev => ({ ...prev, [table]: [...prev[table], created] }));
      return { status: true, data: created };
    } catch (error) {
      console.log(error);
      setErrors(error.response?.data || [`Error creating ${table}`]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editedEntity = async (table, id, entity) => {
    try {
      const res = await editEntity(table, id, entity);
      const updated = res.data.data;
      setEntities(prev => ({
        ...prev,
        [table]: prev[table].map(e => e.id === id ? updated : e)
      }));
      return { status: true, data: updated };
    } catch (error) {
      console.log(error);
      setErrors(error.response?.data || [`Error editing ${table}`]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteEntityById = async (table, id) => {
    try {
      const res = await deleteEntity(table, id);
      setEntities(prev => ({
        ...prev,
        [table]: prev[table].filter(e => e.id !== id)
      }));
      return { status: true, data: res.data.data };
    } catch (error) {
      console.log(error);
      setErrors(error.response?.data || [`Error deleting ${table}`]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const logout = () => {
    Cookies.remove("token");
  };

  return (
    <EntityContext.Provider
      value={{
        getAllEntities,
        createNewEntity,
        editedEntity,
        deleteEntityById,
        entities,
        setEntities,
        logout,
        errors
      }}
    >
      {children}
    </EntityContext.Provider>
  );
};
