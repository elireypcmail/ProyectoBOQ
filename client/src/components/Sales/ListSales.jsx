import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import { useIncExp } from "../../context/IncExpContext";
import SaleFormModal from "./Ui/SalesFormModal";
import SaleDetailModal from "./Ui/SalesDetailModal";
import "../../styles/components/ListZone.css";

const ListSales = () => {
  const { sales, getAllSales, getSaleById, loading } = useIncExp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null); // Venta seleccionada (para detalle o edición)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [fetchingId, setFetchingId] = useState(null);

  useEffect(() => {
    getAllSales();
  }, []);

  const handleOpenDetail = async (id) => {
    try {
      setFetchingId(id);
      const detailedData = await getSaleById(id);
      if (detailedData) {
        setSelectedSale(detailedData);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Error al cargar el detalle de la venta:", error);
    } finally {
      setFetchingId(null);
    }
  };

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    return sales.filter((s) =>
      s.nro_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paciente?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  // Requerimiento: Decimales con coma
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <h2>Gestión de Ventas</h2>
          <p>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Cargando registros...
              </span>
            ) : (
              `${filteredSales.length} registros encontrados`
            )}
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setSelectedSale(null); // Limpiamos para nueva venta
            setIsFormOpen(true);
          }}
        >
          <Plus size={16} /> Nueva Venta
        </button>
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Buscar por factura o cliente..."
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
              <th>Cliente</th>
              <th className="right">Total</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map((s) => (
                <tr key={s.id}>
                  <td className="id">#{s.id}</td>
                  <td className="bold">{s.nro_factura}</td>
                  <td>{s.paciente}</td>
                  <td className="right bold">
                    {formatCurrency(s.total)}
                  </td>
                  <td className="center">
                    <button
                      className="icon-btn"
                      disabled={fetchingId === s.id}
                      onClick={() => handleOpenDetail(s.id)}
                    >
                      {fetchingId === s.id ? (
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
                  {loading ? "Cargando..." : "No se encontraron registros de ventas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulario para Crear o Editar */}
      <SaleFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedSale(null);
        }}
        editData={selectedSale} // Propiedad corregida para el formulario
      />

      {/* Modal de Detalle */}
      <SaleDetailModal
        isOpen={isDetailOpen}
        sale={selectedSale}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSale(null);
        }}
        onEdit={(saleToEdit) => {
          setSelectedSale(saleToEdit); // Cargamos la venta para editar
          setIsDetailOpen(false);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};

export default ListSales;