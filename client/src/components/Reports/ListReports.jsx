import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";

// Context
import { useSales } from "../../context/SalesContext"

// Modals
import ReportsFormModal from "./Ui/ReportsFormModal"; // ✅ Cambiado a ReportsFormModal
import ReportDetailModal from "./Ui/ReportDetailModal"; // ✅ Cambiado a ReportDetailModal

// CSS
import "../../styles/components/ListSellers.css";

const ListReports = () => {
  const { 
    reports, 
    getAllReports, 
    getReportById,
    loading 
  } = useSales(); // ✅ Cambiado a UseSales

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false); 
  const [fetchingId, setFetchingId] = useState(null);

  // --- Estado de Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    getAllReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenDetail = async (id) => {
    try {
      setFetchingId(id);
      
      // Obtenemos el detalle completo del reporte
      const response = await getReportById(id);
      
      if (response.status) {
        setSelectedReport(response.data);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Error al obtener detalle del reporte:", error);
    } finally {
      setFetchingId(null);
    }
  };

  // Filtrado y Ordenación
  const filteredReports = useMemo(() => {
    if (!reports) return [];

    const filtered = reports.filter((r) =>
      String(r.nro_presupuesto).includes(searchTerm) ||
      (r.nombre_paciente || "").toUpperCase().includes(searchTerm.toUpperCase())
    );

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.fecha_creacion || 0);
      const dateB = new Date(b.fecha_creacion || 0);
      return dateB - dateA || (b.id - a.id);
    });
  }, [reports, searchTerm]);

  // --- Cálculos de Paginación ---
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const currentItems = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
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
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  };

  return (
    <div className="v-main-container">
      <div className="v-header-section">
        <div className="v-header-info">
          <h2 className="v-title">Gestión de Reportes</h2>
          <p className="v-subtitle">
            {loading ? (
              <span className="v-loader-text"><Loader2 size={14} className="v-spin" /> Cargando...</span>
            ) : (
              `${filteredReports.length} registros encontrados`
            )}
          </p>
        </div>

        <button 
          className="v-btn-add" 
          onClick={() => { 
            setSelectedReport(null); 
            setIsFormOpen(true); 
          }}
        >
          <Plus size={16} /> Nuevo Reporte
        </button>
      </div>

      <div className="v-toolbar">
        <div className="v-search-box">
          <Search size={16} />
          <input
            placeholder="BUSCAR POR NRO O PACIENTE..."
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
              <th>Nro Reporte</th>
              <th>Paciente</th>
              <th className="v-text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((r) => (
                <tr key={r.id} className="v-table-row">
                  <td className="v-text-center">{formatDate(r.fecha_creacion)}</td>
                  <td className="v-text-center v-bold">{r.nro_reporte}</td>
                  <td style={{ textTransform: 'uppercase' }}>{r.nombre_paciente || "—"}</td>
                  <td className="v-text-center">
                    <button
                      className="v-action-btn"
                      disabled={fetchingId === r.id}
                      onClick={() => handleOpenDetail(r.id)}
                    >
                      {fetchingId === r.id ? (
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
                  {loading ? "Cargando datos..." : "No se encontraron Reportes."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Paginación --- */}
      {totalPages > 1 && (
        <div className="pagination-controls" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="v-page-info">
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>
          <button 
            className="btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* --- Modales --- */}
      <ReportsFormModal 
        isOpen={isFormOpen} 
        onClose={() => { 
          setIsFormOpen(false); 
          setSelectedReport(null); 
        }} 
        editData={selectedReport} 
      />
      
      <ReportDetailModal 
        isOpen={isDetailOpen} 
        report={selectedReport} 
        onClose={() => { 
          setIsDetailOpen(false); 
          setSelectedReport(null); 
        }} 
        onEdit={(reportToEdit) => { 
          setSelectedReport(reportToEdit); 
          setIsDetailOpen(false); 
          setIsFormOpen(true); 
        }} 
      />
    </div>
  );
};

export default ListReports;