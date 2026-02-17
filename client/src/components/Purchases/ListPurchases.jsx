import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import { useIncExp } from "../../context/IncExpContext"; 
import PurchaseFormModal from "./Ui/PurchaseFormModal";
import PurchaseDetailModal from "./Ui/PurchaseDetailModal";
import "../../styles/components/ListZone.css";

const ListPurchases = () => {
  const { shoppings, getAllShoppings, loading } = useIncExp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    getAllShoppings();
  }, []);

  const filteredPurchases = useMemo(() => {
    if (!shoppings) return [];
    return shoppings.filter(p =>
      p.nro_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shoppings, searchTerm]);

  // Función auxiliar para formatear moneda según tus preferencias
  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
          className="btn-primary" 
          onClick={() => { 
            setSelectedPurchase(null); 
            setIsFormOpen(true); 
          }}
        >
          <Plus size={16} /> Nueva Compra
        </button>
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
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
              <th>ID</th>
              <th>Factura</th>
              <th>Proveedor</th>
              <th className="right">Total</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((p) => (
                <tr key={p.id}>
                  <td className="id">#{p.id}</td>
                  <td className="bold">{p.nro_factura}</td>
                  <td>{p.proveedor}</td>
                  <td className="right bold">
                    {/* Formato: $ 1.234,56 */}
                    $ {formatCurrency(p.total)}
                  </td>
                  <td className="center">
                    <button 
                      className="icon-btn" 
                      onClick={() => { 
                        setSelectedPurchase(p); 
                        setIsDetailOpen(true); 
                      }}
                    >
                      <SlOptionsVertical size={16} />
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

      <PurchaseFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={selectedPurchase}
      />

      <PurchaseDetailModal 
        isOpen={isDetailOpen} 
        purchase={selectedPurchase} 
        onClose={() => setIsDetailOpen(false)}
        onEdit={() => { 
          setIsDetailOpen(false); 
          setIsFormOpen(true); 
        }}
      />
    </div>
  );
};

export default ListPurchases;