import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Context
import { useSales } from "../../context/SalesContext";

// Modals
import BudgetsFormModal from "./Ui/BudgetsFormModal";
import BudgetDetailModal from "./Ui/BudgetDetailModal"; // ✅ Descomentado

// CSS
import "../../styles/components/ListSellers.css";

const ListBudgets = ({onClose}) => {
  const { budgets, getAllBudgets, getBudgetById, loading } = useSales();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false); // ✅ Controla la visibilidad del detalle
  const [fetchingId, setFetchingId] = useState(null);

  // --- Estado de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    getAllBudgets();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenDetail = async (id) => {
    try {
      setFetchingId(id);

      // Intentamos obtener el detalle completo (con productos) desde el backend
      const response = await getBudgetById(id);

      if (response.status) {
        setSelectedBudget(response.data);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Error al obtener detalle:", error);
    } finally {
      setFetchingId(null);
    }
  };

  // Filtrado y Ordenación
  const filteredBudgets = useMemo(() => {
    if (!budgets) return [];

    const filtered = budgets.filter(
      (b) =>
        String(b.nro_presupuesto).includes(searchTerm) ||
        (b.nombre_paciente || "")
          .toUpperCase()
          .includes(searchTerm.toUpperCase()),
    );

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.fecha_creacion || 0);
      const dateB = new Date(b.fecha_creacion || 0);
      return dateB - dateA || b.id - a.id;
    });
  }, [budgets, searchTerm]);

  // --- Cálculos de Paginación ---
  const totalPages = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE);
  const currentItems = filteredBudgets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `${num.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="seller-panel-container">
      {/* HEADER */}
      <div className="seller-top-header">
        <div className="seller-title-area">
          <h2>Gestión de Proformas</h2>
          <p>
            {loading ? (
              <span>
                <Loader2 size={14} className="seller-spin" /> Cargando...
              </span>
            ) : (
              `${filteredBudgets.length} registros encontrados`
            )}
          </p>
        </div>

        <div className="seller-actions-group">
          <button
            className="seller-btn-main"
            onClick={() => {
              setSelectedBudget(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={16} /> Nuevo Proforma
          </button>

          {onClose && (
            <button 
              className="seller-btn-close" 
              onClick={onClose}
              title="Cerrar ventana"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="seller-action-bar">
        <div className="seller-search-box">
          <Search size={16} color="var(--seller-muted)" />
          <input
            placeholder="BUSCAR POR NRO O PACIENTE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="seller-table-container">
        <table className="seller-grid-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nro Presupuesto</th>
              <th>Paciente</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((b) => (
                <tr key={b.id}>
                  <td data-label="Fecha">{formatDate(b.fecha_creacion)}</td>
                  <td data-label="Nro Presupuesto" className="seller-id-text">
                    {b.nro_presupuesto}
                  </td>
                  <td
                    data-label="Paciente"
                    style={{ textTransform: "uppercase" }}
                  >
                    {b.nombre_paciente || "—"}
                  </td>
                  <td
                    data-label="Total"
                    style={{ textAlign: "right", fontWeight: "800" }}
                  >
                    {formatCurrency(b.total)}
                  </td>
                  <td data-label="Acciones">
                    <button
                      className="seller-btn-icon"
                      disabled={fetchingId === b.id}
                      onClick={() => handleOpenDetail(b.id)}
                    >
                      {fetchingId === b.id ? (
                        <Loader2 size={16} className="seller-spin" />
                      ) : (
                        <SlOptionsVertical size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{ padding: "3rem", color: "var(--seller-muted)" }}
                >
                  {loading
                    ? "Cargando datos..."
                    : "No se encontraron Proformas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="seller-pagination-nav">
          <button
            className="seller-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ fontSize: "0.9rem", color: "var(--seller-muted)" }}>
            Página <strong>{currentPage}</strong> de{" "}
            <strong>{totalPages}</strong>
          </span>

          <button
            className="seller-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* --- Modales --- */}
      <BudgetsFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBudget(null);
        }}
        editData={selectedBudget}
      />

      {/* ✅ Modal de Detalle Activado */}
      <BudgetDetailModal
        isOpen={isDetailOpen}
        budget={selectedBudget}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBudget(null);
        }}
        onEdit={(budgetToEdit) => {
          setSelectedBudget(budgetToEdit);
          setIsDetailOpen(false);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};

export default ListBudgets;
