import React, { useState, useEffect } from "react";
import { X, Search, Loader2, User } from "lucide-react";
import { useSales } from "../../../../context/SalesContext";
import "../../../../styles/ui/subModals/SearchProductModal.css"; 

const SearchReportModal = ({ onClose, onToggle, selectedItems = [], filterByPacienteId = null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState(null); 
  const { reports, getAllReports, getReportById } = useSales();

  useEffect(() => {
    if (!reports || reports.length === 0) getAllReports();
  }, [reports, getAllReports]);

  const filteredReports = (reports || []).filter(r => {
    // 1. FILTRO DE ESTATUS DE USO
    // Solo permitimos reportes disponibles (estatus_uso === 1)
    if (Number(r.estatus_uso) !== 1) {
      return false;
    }

    // 2. Filtro flexible por paciente:
    if (filterByPacienteId) {
      const rPacienteId = r.id_paciente || r.paciente_id || r.cliente_id || r.id_cliente;
      
      // Si el objeto tiene un ID de paciente y no coincide, lo ocultamos.
      if (rPacienteId && String(rPacienteId) !== String(filterByPacienteId)) {
        return false;
      }
    }

    // 3. Filtro de texto (Número o Nombre)
    const matchesSearch = 
      String(r.nro_reporte || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      String(r.nombre_paciente || r.paciente_nombre || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleSelectClick = async (reportSummary, isAlreadySelected) => {
    // Si ya está seleccionado, lo desmarcamos
    if (isAlreadySelected) {
      const fullSelectedReport = selectedItems.find(item => String(item.id) === String(reportSummary.id));
      onToggle(fullSelectedReport || reportSummary, true); // true indica que se va a remover
      return;
    }

    // Si es un reporte nuevo, traemos el detalle de la API
    setLoadingId(reportSummary.id);
    try {
      const fullReport = await getReportById(reportSummary.id);
      
      if (fullReport) {
        onToggle(fullReport.data, false);
      } else {
        alert("No se pudieron obtener los detalles del reporte.");
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
      alert("Error al cargar los datos del reporte.");
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

  return (
    <div className="spm-overlay">
      <div className="spm-container">
        <header className="spm-header">
          <div className="spm-header-content">
            <h3 className="spm-title">Seleccionar Reporte</h3>
            {filterByPacienteId && reports?.length > 0 && (
              <div className="spm-filter-badge">
                <User size={12} />
                <span>Filtrado por Paciente Seleccionado</span>
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
            placeholder={filterByPacienteId ? "Buscar en los reportes de este paciente..." : "Buscar por número o nombre de paciente..."} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            disabled={!!loadingId}
          />
        </div>

        <div className="spm-results-list">
          {filteredReports.length > 0 ? (
            filteredReports.map(r => {
              const isAlreadySelected = selectedItems.some(item => String(item.id) === String(r.id));
              const isLoading = loadingId === r.id;

              return (
                <div 
                  key={r.id} 
                  className={`spm-product-item ${isAlreadySelected ? "spm-item-selected" : ""} ${isLoading ? "spm-item-loading" : ""}`} 
                  onClick={() => !isLoading && handleSelectClick(r, isAlreadySelected)}
                  style={{ cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1 }}
                >
                  <div className="spm-item-info">
                    <div className="spm-item-sku-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="spm-item-sku">
                        Reporte #{r.nro_reporte} 
                      </span>
                      {isAlreadySelected && <span className="spm-badge-selected" style={{ color: "#d97706", fontSize: "11px", fontWeight: "bold" }}>
                        (AGREGADO - CLIC PARA DESMARCAR)
                      </span>}
                      {isLoading && <Loader2 size={14} className="spm-spin" />}
                    </div>
                    <span className="spm-item-desc" style={{ textTransform: 'uppercase' }}>
                      {r.nombre_paciente || r.paciente_nombre || "PACIENTE DESCONOCIDO"}
                    </span>
                  </div>
                  <div className="spm-item-stats">
                    <span className="spm-stat">Fecha: <b>{formatDate(r.fecha_creacion)}</b></span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="spm-empty-state">
              {filterByPacienteId 
                ? "Este paciente no tiene otros reportes disponibles." 
                : "No se encontraron reportes disponibles."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchReportModal;