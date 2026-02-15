// Dependencies
import React, { createContext, useState, useContext } from "react";

// API Vendedores
import * as PurchasesAPI from "../api/purchases";

// Context
export const PurchasesContext = createContext();

export const usePurchases = () => {
  const context = useContext(PurchasesContext);
  if (!context)
    throw new Error("usePurchases must be used within a PurchasesProvider");
  return context;
};

export const PurchasesProvider = ({ children }) => {
  // -------------------- VENDEDORES --------------------
  const [suppliers, setSuppliers] = useState([]);

  // -------------------- ERRORES --------------------
  const [errors, setErrors] = useState([]);

  // ==================== VENDEDORES ====================
  const getAllSuppliers = async () => {
    try {
      const res = await PurchasesAPI.getAllSuppliers();
      setSuppliers(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching suppliers"],
      ]);
    }
  };

  const createNewSupplier = async (newSupplier) => {
    try {
      const res = await PurchasesAPI.createSupplier(newSupplier);
      setSuppliers((prev) => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error creating supplier"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editSupplier = async (id, supplier) => {
    try {
      const res = await PurchasesAPI.updateSupplier(id, supplier);
      const updated = res.data.data;

      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );

      return { status: true, data: updated };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error editing supplier"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteSupplierById = async (id) => {
    try {
      await PurchasesAPI.deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error deleting supplier"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  return (
    <PurchasesContext.Provider
      value={{
        suppliers,

        // ====== Errores ======
        errors,

        getAllSuppliers,
        createNewSupplier,
        editSupplier,
        deleteSupplierById,

      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
};
