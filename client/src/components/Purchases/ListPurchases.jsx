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
  
  // Local state for fetching individual details
  const [fetchingId, setFetchingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    getAllShoppings();
  }, []);

  // Reset pagination to page 1 whenever the user types a new search term
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

  const filteredPurchases = useMemo(() => {
    if (!shoppings) return [];
    return shoppings.filter(p =>
      p.nro_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shoppings, searchTerm]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);

  // Formats to: $ 1.250,50 
  const formatCurrency = (value) => {
    return `${parseFloat(value).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
              {/* <th>ID</th> */}
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
                  {/* <td className="id">#{p.id}</td> */}
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
            <ChevronLeft size={16} /> Previous
          </button>
          
          <span className="text-sm">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button 
            className="btn-secondary flex items-center gap-1"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next <ChevronRight size={16} />
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