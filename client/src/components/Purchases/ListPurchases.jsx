import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import { useIncExp } from "../../context/IncExpContext"; 
import PurchaseFormModal from "./Ui/PurchaseFormModal";
import PurchaseDetailModal from "./Ui/PurchaseDetailModal";
import "../../styles/components/ListZone.css";

const ListPurchases = () => {
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
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <h2>Gestión de Compras</h2>
          <p>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Cargando registros...
              </span>
            ) : (
              `${filteredPurchases.length} registros encontrados`
            )}
          </p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2" 
          onClick={() => { 
            setSelectedPurchase(null); 
            setIsFormOpen(true); 
          }}
        >
          <Plus size={16} /> Nueva Compra
        </button>
      </div>

      <div className="orders-toolbar">
        <div className="search-box flex items-center gap-2">
          <Search size={16} />
          <input
            placeholder="Buscar por factura o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="center">Fecha</th>
              <th>Factura</th>
              <th>Proveedor</th>
              <th className="right">Total</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((p) => (
                <tr key={p.id}>
                  <td className="center">{formatDate(p.fecha_emision || p.created_at)}</td>
                  <td className="bold">{p.nro_factura}</td>
                  <td>{p.proveedor}</td>
                  <td className="right bold">
                    {formatCurrency(p.total)}
                  </td>
                  <td className="center">
                    <button 
                      className="icon-btn" 
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
                <td colSpan="5" className="center py-10">
                  {loading ? "Cargando..." : "No se encontraron registros de compras."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls flex items-center justify-between" style={{ marginTop: '1rem', padding: '0.5rem 0' }}>
          <button 
            className="btn-secondary flex items-center gap-1"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          
          <span className="text-sm">
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>

          <button 
            className="btn-secondary flex items-center gap-1"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Siguiente <ChevronRight size={16} />
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