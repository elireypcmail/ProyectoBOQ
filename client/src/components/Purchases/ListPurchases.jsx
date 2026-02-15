import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import { useIncExp } from "../../context/IncExpContext"; // Importación del contexto de Egresos
import PurchaseFormModal from "./Ui/PurchaseFormModal";
import PurchaseDetailModal from "./Ui/PurchaseDetailModal";
import "../../styles/components/ListZone.css";

const ListPurchases = () => {
  // Consumimos el estado global del contexto de Egresos
  const { shoppings, getAllShoppings, loading } = useIncExp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Cargar las compras al montar el componente
  useEffect(() => {
    getAllShoppings();
  }, []);

  // Filtro de búsqueda optimizado
  const filteredPurchases = useMemo(() => {
    if (!shoppings) return [];
    return shoppings.filter(p =>
      p.nro_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shoppings, searchTerm]);

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
              <th>Emisión</th>
              <th>Vencimiento</th>
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
                  <td>{p.proveedor_nombre || "N/A"}</td>
                  <td>{p.fecha_emision}</td>
                  <td>
                    <span className={new Date(p.fecha_vencimiento) < new Date() ? "text-danger" : ""}>
                      {p.fecha_vencimiento}
                    </span>
                  </td>
                  <td className="right bold">
                    ${parseFloat(p.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                <td colSpan="7" className="center py-10">
                  {loading ? "Cargando..." : "No se encontraron registros de compras."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modales de Interacción */}
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