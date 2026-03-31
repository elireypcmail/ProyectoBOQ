import React, { useState, useEffect } from "react";
import { X, Search, Loader2, User } from "lucide-react";
import { useSales } from "../../../../context/SalesContext";
// Usamos los mismos estilos para mantener la consistencia visual
import "../../../../styles/ui/subModals/SearchProductModal.css"; 

const SearchBudgetModal = ({ onClose, onToggle, selectedItems = [], filterByPacienteId = null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState(null); 
  const { budgets, getAllBudgets, getBudgetById } = useSales();

  useEffect(() => {
    if (!budgets || budgets.length === 0) getAllBudgets();
  }, [budgets, getAllBudgets]);

  const filteredBudgets = (budgets || []).filter(b => {
    // 1. FILTRO DE ESTATUS DE USO (Solo disponibles)
    // Se asegura de que estatus_uso sea 1 (numérico o string)
    if (b.estatus_uso !== 1 && b.estatus_uso !== "1") {
      return false;
    }

    // 2. Filtro rígidamente por paciente si ya hay uno seleccionado en el formulario
    if (filterByPacienteId) {
      const bPacienteId = b.id_paciente || b.paciente_id;
      if (bPacienteId && String(bPacienteId) !== String(filterByPacienteId)) {
        return false;
      }
    }

    // 3. Filtro de texto (Número o Nombre)
    const matchesSearch = 
      String(b.nro_presupuesto || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(b.nombre_paciente || b.paciente_nombre || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleSelectClick = async (budgetSummary, isAlreadySelected) => {
    // Si ya está en la lista de seleccionados, lo quitamos
    if (isAlreadySelected) {
      const fullSelectedBudget = selectedItems.find(item => String(item.id) === String(budgetSummary.id));
      onToggle(fullSelectedBudget || budgetSummary, true); // true indica remover
      return;
    }

    // Si es nuevo, buscamos el detalle completo para obtener los productos/ítems
    setLoadingId(budgetSummary.id);
    try {
      const fullBudget = await getBudgetById(budgetSummary.id);
      
      if (fullBudget) {
        // Asumiendo que la respuesta sigue la estructura .data
        onToggle(fullBudget.data || fullBudget, false); 
      } else {
        alert("No se pudieron obtener los detalles del presupuesto.");
      }
    } catch (error) {
      console.error("Error fetching budget details:", error);
      alert("Error al cargar los datos del presupuesto.");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="spm-overlay">
      <div className="spm-container">
        <header className="spm-header">
          <div className="spm-header-content">
            <h3 className="spm-title">Seleccionar Presupuesto</h3>
            {filterByPacienteId && budgets?.length > 0 && (
              <div className="spm-filter-badge">
                <User size={12} />
                <span>Filtrado por Paciente</span>
              </div>
            )}
          </div>
          <button className="spm-btn-close" onClick={onClose} disabled={!!loadingId}>
            <X size={20} />
          </button>
        </header>

        <div className="spm-search-wrapper">
          <Search size={18} className="spm-search-icon" />
          <input 
            className="spm-input"
            autoFocus 
            placeholder={filterByPacienteId ? "Buscar en presupuestos de este paciente..." : "Buscar por número o nombre..."} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            disabled={!!loadingId}
          />
        </div>

        <div className="spm-results-list">
          {filteredBudgets.length > 0 ? (
            filteredBudgets.map(b => {
              const isAlreadySelected = selectedItems.some(item => String(item.id) === String(b.id));
              const isLoading = loadingId === b.id;

              return (
                <div 
                  key={b.id} 
                  className={`spm-product-item ${isAlreadySelected ? "spm-item-selected" : ""} ${isLoading ? "spm-item-loading" : ""}`} 
                  onClick={() => !isLoading && handleSelectClick(b, isAlreadySelected)}
                  style={{ cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1 }}
                >
                  <div className="spm-item-info">
                    <div className="spm-item-sku-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="spm-item-sku">
                        Presupuesto #{b.nro_presupuesto} 
                      </span>
                      {isAlreadySelected && (
                        <span className="spm-badge-selected" style={{ color: "#d97706", fontSize: "11px", fontWeight: "bold" }}>
                          (AGREGADO - CLIC PARA QUITAR)
                        </span>
                      )}
                      {isLoading && <Loader2 size={14} className="spm-spin" />}
                    </div>
                    <span className="spm-item-desc" style={{ textTransform: 'uppercase' }}>
                      {b.nombre_paciente || b.paciente_nombre || "PACIENTE DESCONOCIDO"}
                    </span>
                  </div>
                  <div className="spm-item-stats">
                    <span className="spm-stat">Fecha: <b>{formatDate(b.fecha_creacion)}</b></span>
                    <span className="spm-stat">Total: <b>${formatCurrency(b.total)}</b></span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="spm-empty-state">
              {filterByPacienteId 
                ? "No hay presupuestos disponibles para este paciente." 
                : "No se encontraron presupuestos disponibles."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBudgetModal;