import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import { useIncExp } from "../../context/IncExpContext"; 
import PurchaseFormModal from "./Ui/PurchaseFormModal";
import PurchaseDetailModal from "./Ui/PurchaseDetailModal";
import "../../styles/components/ListZone.css";

const ListPurchases = ({ onClose }) => {
  const { shoppings, getAllShoppings, getShoppingById, loading } = useIncExp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [fetchingId, setFetchingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    getAllShoppings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenDetail = async (id) => {
    try {
      setFetchingId(id);
      const detailedData = await getShoppingById(id);
      if (detailedData) {
        setSelectedPurchase(detailedData);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Error al cargar el detalle de la compra:", error);
    } finally {
      setFetchingId(null);
    }
  };

  // Filtrado y Ordenación por Fecha e ID (Decreciente)
  const filteredPurchases = useMemo(() => {
    if (!shoppings) return [];
    
    // 1. Filtrar
    const filtered = shoppings.filter(p =>
      p.nro_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Ordenar por fecha y luego por ID (ambos decrecientes)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.fecha_emision || a.created_at || 0);
      const dateB = new Date(b.fecha_emision || b.created_at || 0);

      if (dateB - dateA !== 0) {
        return dateB - dateA; // Ordenar por fecha
      }
      
      // Si la fecha es igual, desempatar por ID decreciente
      return (b.id || 0) - (a.id || 0);
    });
  }, [shoppings, searchTerm]);

  // Cálculos de Paginación
  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
<div className="pl-main-container">
      {/* HEADER */}
      <div className="pl-header-section">
        <div className="pl-title-group">
          <h2>Gestión de Compras</h2>
          <p>
            {loading ? (
              <span className="pl-loading-text">
                <Loader2 size={14} className="animate-spin" /> Cargando registros...
              </span>
            ) : (
              `${filteredPurchases.length} registros encontrados`
            )}
          </p>
        </div>
        <div className="pl-actions-group">
          <button 
            className="pl-btn-action" 
            onClick={() => { 
              setSelectedPurchase(null); 
              setIsFormOpen(true); 
            }}
          >
            <Plus size={18} /> Nueva Compra
          </button>

          {onClose && (
            <button 
              className="pl-btn-close" 
              onClick={onClose}
              title="Cerrar ventana"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="pl-toolbar">
        <div className="pl-search-wrapper">
          <Search size={18} color="var(--pl-muted)" />
          <input
            placeholder="BUSCAR POR FACTURA O PROVEEDOR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="pl-table-frame">
        <table className="pl-data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Factura</th>
              <th>Proveedor</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th style={{ width: '80px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((p) => (
                <tr key={p.id}>
                  <td data-label="Fecha" className="pl-date-cell">
                    {formatDate(p.fecha_emision || p.created_at)}
                  </td>
                  <td data-label="Factura" className="pl-sku-cell">
                    {p.nro_factura}
                  </td>
                  <td data-label="Proveedor" style={{ fontWeight: 600 }}>
                    {p.proveedor}
                  </td>
                  <td data-label="Total" className="pl-amount-cell">
                    {formatCurrency(p.total)}
                  </td>
                  <td data-label="Acciones">
                    <button 
                      className="pl-icon-only-btn" 
                      disabled={fetchingId === p.id}
                      onClick={() => handleOpenDetail(p.id)}
                    >
                      {fetchingId === p.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <SlOptionsVertical size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  {loading ? "Sincronizando datos..." : "No se encontraron registros de compras."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="pl-pagination-area">
          <button 
            className="pl-page-node"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="pl-pagination-info">
            Página <b>{currentPage}</b> de <b>{totalPages}</b>
          </span>

          <button 
            className="pl-page-node"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <PurchaseFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={selectedPurchase}
      />

      <PurchaseDetailModal 
        isOpen={isDetailOpen} 
        purchase={selectedPurchase} 
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPurchase(null);
        }}
        onEdit={() => { 
          setIsDetailOpen(false); 
          setIsFormOpen(true); 
        }}
      />
    </div>
  );
};

export default ListPurchases;