import React, { createContext, useState, useContext } from "react";
import * as ShoppingAPI from "../api/incExp"; // Ajusta la ruta si es necesario

export const IncExpContext = createContext();

export const useIncExp = () => {
  const context = useContext(IncExpContext);
  if (!context)
    throw new Error("useIncExp debe ser usado dentro de un IncExpProvider");
  return context;
};

export const IncExpProvider = ({ children }) => {
  const [shoppings, setShoppings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------- FLUJO DE COMPRAS (EGRESOS) --------------------

  const getAllShoppings = async () => {
    setLoading(true);
    try {
      const res = await ShoppingAPI.getAllShopping();
      setShoppings(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [...prev, "Error al cargar el historial de compras"]);
    } finally {
      setLoading(false);
    }
  };

  const getShoppingById = async (id) => {
    try {
      const res = await ShoppingAPI.getShoppingById(id);
      return res.data?.data;
    } catch (error) {
      setErrors((prev) => [...prev, "Error al obtener la factura"]);
      return null;
    }
  };

  /**
   * Procesa el ingreso de una factura (Costo, Precio, Lotes, Kardex)
   */
  const createNewShopping = async (shoppingData) => {
    try {
      const res = await ShoppingAPI.createShopping(shoppingData);

      // Solo validar éxito
      if (res.data?.status) {
        await getAllShoppings(); // refrescar lista desde el servidor
      }

      return { status: true };
    } catch (error) {
      const errorDetail =
        error.response?.data?.msg ||
        "Error en el servidor al procesar la compra";

      setErrors((prev) => [...prev, errorDetail]);

      return { status: false, error: errorDetail };
    }
  };


  const deleteShoppingById = async (id) => {
    try {
      await ShoppingAPI.deleteShopping(id);
      setShoppings((prev) => prev.filter((s) => s.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [...prev, "No se pudo eliminar la factura"]);
      return { status: false };
    }
  };

  return (
    <IncExpContext.Provider
      value={{
        shoppings,
        errors,
        loading,
        setErrors,
        
        getAllShoppings,
        getShoppingById,
        createNewShopping,
        deleteShoppingById
      }}
    >
      {children}
    </IncExpContext.Provider>
  );
};