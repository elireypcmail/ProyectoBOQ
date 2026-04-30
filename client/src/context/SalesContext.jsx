// Dependencies
import React, { createContext, useState, useContext } from "react";

// APIs
import * as SalesAPI from "../api/sales";

// Context
export const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context)
    throw new Error("useSales must be used within a SalesProvider");
  return context;
};

export const SalesProvider = ({ children }) => {
  const [sellers, setSellers] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [reports, setReports] = useState([]); // Nuevo estado para reportes
  const [payments, setPayments] = useState([]);
  const [errors, setErrors] = useState([]);

  // ====================================================
  // SELLERS
  // ====================================================
  const getAllSellers = async () => {
    try {
      const res = await SalesAPI.getAllSellers();
      setSellers(res.data?.data || []);
      return res;
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || "Error fetching sellers"]);
    }
  };

  const createNewSeller = async (data) => {
    try {
      const res = await SalesAPI.createSeller(data);
      setSellers(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editSeller = async (id, data) => {
    try {
      const res = await SalesAPI.updateSeller(id, data);
      const updated = res.data.data;
      setSellers(prev => prev.map(s => s.id === id ? updated : s));
      return { status: true, data: updated };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteSellerById = async (id) => {
    try {
      await SalesAPI.deleteSeller(id);
      setSellers(prev => prev.filter(s => s.id !== id));
      return { status: true };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // ====================================================
  // BUDGETS (Presupuestos)
  // ====================================================
  const getAllBudgets = async () => {
    try {
      const res = await SalesAPI.getAllBudgets();
      setBudgets(res.data?.data || []);
      return res;
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || "Error fetching budgets"]);
    }
  };

  const getBudgetById = async (id) => {
    try {
      const res = await SalesAPI.getBudgetById(id);
      return { status: true, data: res.data.data };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const createNewBudget = async (data) => {
    try {
      const res = await SalesAPI.createBudget(data);
      setBudgets(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editBudget = async (id, data) => {
    try {
      const res = await SalesAPI.updateBudget(id, data);
      const updated = res.data.data;
      setBudgets(prev => prev.map(b => b.id === id ? updated : b));
      return { status: true, data: updated };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteBudgetById = async (id) => {
    try {
      await SalesAPI.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      return { status: true };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const exportBudgetToPDF = async (budgetId, exportData) => {
    try {
      // exportData debe ser { tasa: 40,25, id_usuario: 1 }
      const res = await SalesAPI.exportBudgetToPDF(budgetId, exportData);
      return { status: true, data: res.data };
    } catch (error) {
      return { 
        status: false, 
        error: error.response?.data?.msg || error.message 
      };
    }
  };

  // ====================================================
  // REPORTS (Reportes de Instrumentación)
  // ====================================================
  const getAllReports = async () => {
    try {
      const res = await SalesAPI.getAllReports();
      setReports(res.data?.data || []);
      return res;
    } catch (error) {
      setErrors(prev => [...prev, error.response?.data || "Error fetching reports"]);
    }
  };

  const getReportById = async (id) => {
    try {
      const res = await SalesAPI.getReportById(id);
      return { status: true, data: res.data.data };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const createNewReport = async (data) => {
    try {
      const res = await SalesAPI.createReport(data);
      setReports(prev => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editReport = async (id, data) => {
    try {
      const res = await SalesAPI.updateReport(id, data);
      const updated = res.data.data;
      setReports(prev => prev.map(r => r.id === id ? updated : r));
      return { status: true, data: updated };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteReportById = async (id) => {
    try {
      await SalesAPI.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      return { status: true };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // ====================================================
  // PAYMENTS
  // ====================================================
  const getPaymentById = async (id) => {
    try {
      const res = await SalesAPI.getPaymentById(id);
      const normalized = Array.isArray(res.data?.data) ? res.data.data : [res.data.data];
      setPayments(normalized);
      return normalized;
    } catch (error) {
      return [];
    }
  };

  const createNewPayment = async (data) => {
    try {
      const res = await SalesAPI.createPayment(data);
      setPayments(prev => [res.data.data, ...prev]);
      return { status: true, data: res.data.data };
    } catch (error) {
      return { status: false, error: error.response?.data || error.message };
    }
  };

  return (
    <SalesContext.Provider
      value={{
        sellers, getAllSellers, createNewSeller, editSeller, deleteSellerById,
        budgets, getAllBudgets, getBudgetById, createNewBudget, editBudget, deleteBudgetById, exportBudgetToPDF,
        reports, getAllReports, getReportById, createNewReport, editReport, deleteReportById,
        payments, getPaymentById, createNewPayment,
        errors
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};