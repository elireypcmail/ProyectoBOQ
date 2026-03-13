// Dependencies
import React, { createContext, useState, useContext } from "react";

// APIs
import * as SellersAPI from "../api/sales";
import * as BudgetsAPI from "../api/sales";

// Context
export const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context)
    throw new Error("useSales must be used within a SalesProvider");
  return context;
};

export const SalesProvider = ({ children }) => {

  // -------------------- SELLERS --------------------
  const [sellers, setSellers] = useState([]);

  // -------------------- BUDGETS --------------------
  const [budgets, setBudgets] = useState([]);

  // -------------------- ERRORS --------------------
  const [errors, setErrors] = useState([]);

  // ====================================================
  // SELLERS
  // ====================================================

  const getAllSellers = async () => {
    try {
      const res = await SellersAPI.getAllSellers();
      setSellers(res.data?.data || []);
      return res;
    } catch (error) {
      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error fetching sellers"]
      ]);
    }
  };

  const createNewSeller = async (data) => {
    try {
      const res = await SellersAPI.createSeller(data);

      setSellers(prev => [...prev, res.data.data]);

      return {
        status: true,
        data: res.data.data
      };

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error creating seller"]
      ]);

      return {
        status: false,
        error: error.response?.data || error.message
      };
    }
  };

  const editSeller = async (id, data) => {
    try {

      const res = await SellersAPI.updateSeller(id, data);
      const updated = res.data.data;

      setSellers(prev =>
        prev.map(s => s.id === id ? updated : s)
      );

      return {
        status: true,
        data: updated
      };

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error editing seller"]
      ]);

      return {
        status: false,
        error: error.response?.data || error.message
      };
    }
  };

  const deleteSellerById = async (id) => {
    try {

      await SellersAPI.deleteSeller(id);

      setSellers(prev =>
        prev.filter(s => s.id !== id)
      );

      return { status: true };

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error deleting seller"]
      ]);

      return {
        status: false,
        error: error.response?.data || error.message
      };
    }
  };

  const saveFilesSeller = async (id_seller, files, filesJson) => {
    try {

      await SellersAPI.saveFileSeller(id_seller, files, filesJson);

      const res = await getAllSellers();
      setSellers(res?.data?.data || []);

      return { status: true };

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error saving seller files"]
      ]);

      return {
        status: false,
        error: error.response?.data || error.message
      };
    }
  };

  // ====================================================
  // BUDGETS
  // ====================================================

  const getAllBudgets = async () => {
    try {

      const res = await BudgetsAPI.getAllBudgets();

      setBudgets(res.data?.data || []);

      return res;

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error fetching budgets"]
      ]);
    }
  };

  const getBudgetById = async (id) => {
    try {

      const res = await BudgetsAPI.getBudgetById(id);

      return {
        status: true,
        data: res.data.data
      };

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error fetching budget"]
      ]);

      return {
        status: false,
        error: error.response?.data || error.message
      };
    }
  };

  const createNewBudget = async (data) => {
    try {

      const res = await BudgetsAPI.createBudget(data);

      setBudgets(prev => [...prev, res.data.data]);

      return {
        status: true,
        data: res.data.data
      };

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error creating budget"]
      ]);

      return {
        status: false,
        error: error.response?.data || error.message
      };
    }
  };

  const editBudget = async (id, data) => {
    try {

      const res = await BudgetsAPI.updateBudget(id, data);

      const updated = res.data.data;

      setBudgets(prev =>
        prev.map(b => b.id === id ? updated : b)
      );

      return {
        status: true,
        data: updated
      };

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error editing budget"]
      ]);

      return {
        status: false,
        error: error.response?.data || error.message
      };
    }
  };

  const deleteBudgetById = async (id) => {
    try {

      await BudgetsAPI.deleteBudget(id);

      setBudgets(prev =>
        prev.filter(b => b.id !== id)
      );

      return { status: true };

    } catch (error) {

      setErrors(prev => [
        ...prev,
        error.response?.data || ["Error deleting budget"]
      ]);

      return {
        status: false,
        error: error.response?.data || error.message
      };
    }
  };

  return (
    <SalesContext.Provider
      value={{

        // sellers
        sellers,
        getAllSellers,
        createNewSeller,
        editSeller,
        deleteSellerById,
        saveFilesSeller,

        // budgets
        budgets,
        getAllBudgets,
        getBudgetById,
        createNewBudget,
        editBudget,
        deleteBudgetById,

        // errors
        errors

      }}
    >
      {children}
    </SalesContext.Provider>
  );
};