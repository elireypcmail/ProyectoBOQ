import React, { createContext, useState, useContext } from "react";
import * as ShoppingAPI from "../api/incExp";

export const IncExpContext = createContext();

export const useIncExp = () => {
  const context = useContext(IncExpContext);
  if (!context)
    throw new Error("useIncExp debe ser usado dentro de un IncExpProvider");
  return context;
};

export const IncExpProvider = ({ children }) => {

  /* ================= ESTADOS ================= */

  const [shoppings, setShoppings] = useState([]);
  const [sales, setSales] = useState([]);

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ============================================================
     ===================== COMPRAS (EGRESOS) ====================
     ============================================================ */

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
      setErrors((prev) => [...prev, "Error al obtener la compra"]);
      return null;
    }
  };

  const createNewShopping = async (shoppingData) => {
    try {
      const res = await ShoppingAPI.createShopping(shoppingData);

      if (res.data?.status) {
        await getAllShoppings();
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
      setErrors((prev) => [...prev, "No se pudo eliminar la compra"]);
      return { status: false };
    }
  };

  /* ============================================================
     ====================== VENTAS (INGRESOS) ===================
     ============================================================ */

  const getAllSales = async () => {
    setLoading(true);
    try {
      const res = await ShoppingAPI.getAllSales();
      setSales(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [...prev, "Error al cargar el historial de ventas"]);
    } finally {
      setLoading(false);
    }
  };

  const getSaleById = async (id) => {
    try {
      const res = await ShoppingAPI.getSalesById(id);
      return res.data?.data;
    } catch (error) {
      setErrors((prev) => [...prev, "Error al obtener la venta"]);
      return null;
    }
  };

  const confirmSale = async (id) => {
    try {
      const res = await ShoppingAPI.confirmSales(id);
      // Si es 200, devolvemos los datos
      return res.data;
    } catch (error) {
      // Si el servidor respondió con un error (400, 404, 500...)
      if (error.response && error.response.data) {
        console.log("Error del servidor:", error.response.data);
        // Devolvemos el objeto de error que enviamos desde el modelo (status, code, msg)
        return error.response.data;
      }
      
      // Si es un error de red o algo más grave
      setErrors((prev) => [...prev, "Error de conexión con el servidor"]);
      return { status: false, msg: "Error de red", code: 500 };
    }
  };

  const createNewSale = async (saleData) => {
    try {
      const res = await ShoppingAPI.createSales(saleData);

      if (res.data?.status) {
        await getAllSales();
      }

      return res.data
    } catch (error) {
      const errorDetail =
        error.response?.data?.msg ||
        "Error en el servidor al procesar la venta";

      setErrors((prev) => [...prev, errorDetail]);
      return { status: false, error: errorDetail };
    }
  };

  const editSale = async (id, saleData) => {
    try {
      const res = await ShoppingAPI.editSales(id, saleData);

      if (res.data?.status) {
        await getAllSales();
      }

      return res.data
    } catch (error) {
      const errorDetail =
        error.response?.data?.msg ||
        "Error en el servidor al procesar la venta";

      setErrors((prev) => [...prev, errorDetail]);
      return { status: false, error: errorDetail };
    }
  };

  const deleteSaleById = async (id) => {
    try {
      await ShoppingAPI.deleteSales(id);
      setSales((prev) => prev.filter((s) => s.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [...prev, "No se pudo eliminar la venta"]);
      return { status: false };
    }
  };

  /* ================= PROVIDER ================= */

  return (
    <IncExpContext.Provider
      value={{
        // Estados
        shoppings,
        sales,
        errors,
        loading,
        setErrors,

        // Compras
        getAllShoppings,
        getShoppingById,
        createNewShopping,
        deleteShoppingById,

        // Ventas
        getAllSales,
        getSaleById,
        confirmSale,
        createNewSale,
        editSale,
        deleteSaleById
      }}
    >
      {children}
    </IncExpContext.Provider>
  );
};