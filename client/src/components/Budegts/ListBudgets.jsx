import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Context
import { useSales } from "../../context/SalesContext";

// Modals
import BudgetsFormModal from "./Ui/BudgetsFormModal";
// import BudgetDetailModal from "./Ui/BudgetDetailModal"; // Descomentar cuando esté listo

// CSS
import "../../styles/components/ListSellers.css";

const ListBudgets = () => {
  const { 
    budgets, 
    getAllBudgets, 
    getBudgetById,
    loading 
  } = useSales();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [fetchingId, setFetchingId] = useState(null);

  // --- Estado de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    getAllBudgets();
  }, []);

  // Reiniciar a página 1 cuando el usuario busca algo
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenDetail = async (id) => {
    try {
      setFetchingId(id);
      
      const detailedData = getBudgetById ? await getBudgetById(id) : budgets.find(b => b.id === id);
      
      if (detailedData) {
        setSelectedBudget(detailedData);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Error al obtener detalle:", error);
    } finally {
      setFetchingId(null);
    }
  };

  // Filtrado y Ordenación (Fecha e ID de manera decreciente)
  const filteredBudgets = useMemo(() => {
    if (!budgets) return [];

    const filtered = budgets.filter((b) =>
      String(b.id).includes(searchTerm) ||
      (b.nombre_paciente || "").toUpperCase().includes(searchTerm.toUpperCase())
    );

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.fecha || a.created_at || 0);
      const dateB = new Date(b.fecha || b.created_at || 0);
      
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      return (b.id || 0) - (a.id || 0);
    });
  }, [budgets, searchTerm]);

  // --- Cálculos de Paginación ---
  const totalPages = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredBudgets.slice(indexOfFirstItem, indexOfLastItem);

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    // Ajustado a dólares con coma para decimales según tus preferencias
    return `$ ${num.toLocaleString("es-AR", {
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
      year: "numeric"
    });
  };

  return (
    <div className="v-main-container">
      <div className="v-header-section">
        <div className="v-header-info">
          <h2 className="v-title">Gestión de Proformas</h2>
          <p className="v-subtitle">
            {loading ? (
              <span className="v-loader-text"><Loader2 size={14} className="v-spin" /> Cargando...</span>
            ) : (
              `${filteredBudgets.length} registros encontrados`
            )}
          </p>
        </div>

        <button 
          className="v-btn-add" 
          onClick={() => { 
            setSelectedBudget(null); 
            setIsFormOpen(true); 
          }}
        >
          <Plus size={16} /> Nuevo Proforma
        </button>
      </div>

      <div className="v-toolbar">
        <div className="v-search-box">
          <Search size={16} />
          <input
            placeholder="BUSCAR POR ID O PACIENTE..."
            value={searchTerm}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="v-table-container">
        <table className="v-data-table">
          <thead>
            <tr>
              <th className="v-text-center">Fecha</th>
              <th>ID</th>
              <th>Paciente</th>
              <th className="v-text-right">Total</th>
              <th className="v-text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((b) => (
                <tr key={b.id} className="v-table-row">
                  <td className="v-text-center">{formatDate(b.fecha || b.created_at)}</td>
                  <td className="v-text-center v-bold">#{b.id}</td>
                  <td style={{ textTransform: 'uppercase' }}>{b.nombre_paciente || "—"}</td>
                  <td className="v-text-right v-bold">{formatCurrency(b.total)}</td>
                  <td className="v-text-center">
                    <button
                      className="v-action-btn"
                      disabled={fetchingId === b.id}
                      onClick={() => handleOpenDetail(b.id)}
                    >
                      {fetchingId === b.id ? (
                        <Loader2 size={16} className="v-spin" />
                      ) : (
                        <SlOptionsVertical size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="v-empty-state">
                  {loading ? "Cargando datos..." : "No se encontraron Proformas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Controles de Paginación --- */}
      {totalPages > 1 && (
        <div className="pagination-controls" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              opacity: currentPage === 1 ? 0.5 : 1, 
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          
          <span className="v-page-info">
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>

          <button 
            className="btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              opacity: currentPage === totalPages ? 0.5 : 1, 
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
          >
            Siguiente <ChevronRight size={16} />
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
      
      {/* <BudgetDetailModal 
          isOpen={isDetailOpen} 
          budget={selectedBudget} 
          onClose={() => { setIsDetailOpen(false); setSelectedBudget(null) }} 
          onEdit={(budgetToEdit) => { 
            setSelectedBudget(budgetToEdit); 
            setIsDetailOpen(false); 
            setIsFormOpen(true); 
          }} 
        />
      */}
    </div>
  );
};

export default ListBudgets;