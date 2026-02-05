import React, { useEffect, useState, useMemo } from "react";
import { useProducts } from "../../context/ProductsContext";
import { Search, ChevronLeft, ChevronRight, History, User, Calendar, Tag, ArrowRight } from "lucide-react";
import { SlOptionsVertical } from "react-icons/sl";
import "../../styles/components/ListPrices.css";

const ListPrices = ({ productId }) => {
  const { getAuditProd, audits } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (productId) getAuditProd(productId);
  }, [productId]);

  const filteredAudits = useMemo(() => {
    return audits.filter(a =>
      a.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [audits, searchTerm]);

  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
  const currentAudits = filteredAudits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(value);

  // Función para renderizar la tendencia del cambio
  const PriceChange = ({ oldVal, newVal, isPercent = false }) => {
    const isUp = newVal > oldVal;
    const isDown = newVal < oldVal;
    return (
      <div className="lph-price-flow">
        <span className="lph-old-price">{isPercent ? `${oldVal}%` : formatCurrency(oldVal)}</span>
        <ArrowRight size={12} className="lph-arrow" />
        <span className={`lph-new-price ${isUp ? 'up' : isDown ? 'down' : ''}`}>
          {isPercent ? `${newVal}%` : formatCurrency(newVal)}
        </span>
      </div>
    );
  };

  return (
    <div className="lph-container">
      <div className="lph-header">
        <div className="lph-title-section">
          <div className="lph-icon-circle"><History size={20} /></div>
          <div>
            <h2>Historial de Precios y Costos</h2>
            <p>Se han encontrado {filteredAudits.length} modificaciones</p>
          </div>
        </div>

        <div className="lph-search-wrapper">
          <Search size={18} className="lph-search-icon" />
          <input
            type="text"
            placeholder="Buscar por usuario..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="lph-table-container">
        <table className="lph-table">
          <thead>
            <tr>
              <th><Calendar size={14} /> Fecha y Hora</th>
              <th><User size={14} /> Usuario</th>
              <th>Costo Unitario</th>
              <th>Margen</th>
              <th>Precio Venta</th>
              <th className="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentAudits.length > 0 ? currentAudits.map(a => (
              <tr key={a.auditoria_id}>
                <td className="lph-date-cell">
                  <span>{new Date(a.fecha).toLocaleDateString()}</span>
                  <small>{new Date(a.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </td>
                <td className="lph-user-cell">
                  <strong>{a.usuario_nombre}</strong>
                </td>
                <td><PriceChange oldVal={a.costo_unitario_anterior} newVal={a.costo_unitario_nuevo} /></td>
                <td><PriceChange oldVal={a.margen_ganancia_anterior} newVal={a.margen_ganancia_nuevo} isPercent /></td>
                <td><PriceChange oldVal={a.precio_venta_anterior} newVal={a.precio_venta_nuevo} /></td>
                <td className="center">
                  <button className="lph-action-btn" onClick={() => { setSelectedAudit(a); setIsDetailsModalOpen(true); }}>
                    <SlOptionsVertical size={14} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="lph-empty">No se registran cambios recientemente</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="lph-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
          <span className="lph-page-info">Página <strong>{currentPage}</strong> de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
        </div>
      )}

      {/* MODAL DETALLES */}
      {isDetailsModalOpen && selectedAudit && (
        <div className="lph-modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="lph-modal-card" onClick={e => e.stopPropagation()}>
            <div className="lph-modal-header">
              <h3>Detalles de Auditoría</h3>
              <button className="lph-close-btn" onClick={() => setIsDetailsModalOpen(false)}>&times;</button>
            </div>
            
            <div className="lph-modal-grid">
              <div className="lph-detail-item full">
                <label><Tag size={12} /> Producto</label>
                <p>{selectedAudit.descripcion}</p>
              </div>
              <div className="lph-detail-item">
                <label><User size={12} /> Usuario Responsable</label>
                <p>{selectedAudit.usuario_nombre}</p>
                <small>{selectedAudit.usuario_email}</small>
              </div>
              <div className="lph-detail-item">
                <label><Calendar size={12} /> Registro</label>
                <p>{new Date(selectedAudit.fecha).toLocaleString()}</p>
              </div>
            </div>

            <div className="lph-modal-comparison">
              <h4>Resumen de Cambios</h4>
              <div className="lph-comp-row">
                <span>Costo Unitario:</span>
                <PriceChange oldVal={selectedAudit.costo_unitario_anterior} newVal={selectedAudit.costo_unitario_nuevo} />
              </div>
              <div className="lph-comp-row">
                <span>Precio Venta:</span>
                <PriceChange oldVal={selectedAudit.precio_venta_anterior} newVal={selectedAudit.precio_venta_nuevo} />
              </div>
              <div className="lph-comp-row">
                <span>Margen de Ganancia:</span>
                <PriceChange oldVal={selectedAudit.margen_ganancia_anterior} newVal={selectedAudit.margen_ganancia_nuevo} isPercent />
              </div>
            </div>

            <button className="lph-btn-close-modal" onClick={() => setIsDetailsModalOpen(false)}>Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPrices;