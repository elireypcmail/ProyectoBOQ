// Dependencies
import React, { createContext, useState, useContext } from "react";

// API Vendedores
import * as SellersAPI from "../api/sales";

// Context
export const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context)
    throw new Error("useSales must be used within a SalesProvider");
  return context;
};

export const SalesProvider = ({ children }) => {
  // -------------------- VENDEDORES --------------------
  const [sellers, setSellers] = useState([]);

  // -------------------- ERRORES --------------------
  const [errors, setErrors] = useState([]);

  // ==================== VENDEDORES ====================

  const getAllSellers = async () => {
    try {
      const res = await SellersAPI.getAllSellers();
      setSellers(res.data?.data || []);
      return res;
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error fetching sellers"],
      ]);
    }
  };

  const createNewSeller = async (newSeller) => {
    try {
      const res = await SellersAPI.createSeller(newSeller);
      setSellers(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error creating seller"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editSeller = async (id, seller) => {
    try {
      const res = await SellersAPI.updateSeller(id, seller);
      const updated = res.data.data;

      setSellers(prev =>
        prev.map(s => (s.id === id ? updated : s))
      );

      return { status: true, data: updated };
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error editing seller"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteSellerById = async (id) => {
    try {
      await SellersAPI.deleteSeller(id);
      setSellers(prev => prev.filter(s => s.id !== id));
      return { status: true };
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error deleting seller"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const saveFilesSeller = async (id_seller, files, filesJson) => {
    try {
      await SellersAPI.saveFileSeller(id_seller, files, filesJson);

      // Refrescar lista desde API
      const res = await getAllSellers();
      setSellers(res?.data?.data || []);

      return { status: true };
    } catch (error) {
      setErrors(error.response?.data || ["Error saving seller files"]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  return (
    <SalesContext.Provider
      value={{
        sellers,
        errors,
        getAllSellers,
        createNewSeller,
        editSeller,
        deleteSellerById,
        saveFilesSeller,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};