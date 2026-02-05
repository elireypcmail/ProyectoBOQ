import React, { useState, useEffect } from "react"; // Añadido useEffect
import { 
  Pencil, Trash2, X, Package, Tag, Layers, Hash, 
  TrendingUp, DollarSign, AlertCircle, Bookmark,
  History, Boxes, Warehouse, Lock // Añadido Lock para el icono de bloqueo
} from "lucide-react";
import { useProducts } from "../../context/ProductsContext";
import ListLots from "../Products/ListLots"; 
import ListPrices from "../Products/ListPrices";
import ListEdeposits from "../Products/ListEdeposits";
import "../../styles/ui/ModalDetailed.css";

const ModalDetailed = ({
  isOpen,
  product,
  category,
  brand,
  onClose,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const { getAuditProd, audits } = useProducts();

  // Cargar auditorías cuando el modal se abre o cambia el producto
  useEffect(() => {
    if (isOpen && product?.id) {
      getAuditProd(product.id);
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  // Verificamos si hay movimientos (auditorías)
  // Asumiendo que 'audits' es un array o tiene una propiedad data que lo es
  const auditList = Array.isArray(audits) ? audits : (audits?.data || []);
  const hasHistory = auditList.length > 0;

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="pdm-overlay">
      <div className="pdm-container">
        
        {/* HEADER ESTATICO */}
        <div className="pdm-header">
          <div className="pdm-title-group">
            <div className="pdm-icon-main">
              <Package size={24} />
            </div>
            <div>
              <h3 className="pdm-title">{product.descripcion}</h3>
              <span className={`pdm-badge ${product.estatus ? 'active' : 'inactive'}`}>
                {product.estatus ? "Activo en Catálogo" : "Producto Inactivo"}
              </span>
            </div>
          </div>
          <button className="pdm-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div className="pdm-tabs">
          <button 
            className={`pdm-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Bookmark size={16} /> Información General
          </button>
          <button 
            className={`pdm-tab-btn ${activeTab === 'lotes' ? 'active' : ''}`}
            onClick={() => setActiveTab('lotes')}
          >
            <Boxes size={16} /> Lotes
          </button>
          
          <button 
            className={`pdm-tab-btn ${activeTab === 'depositos' ? 'active' : ''}`}
            onClick={() => setActiveTab('depositos')}
          >
            <Warehouse size={16} /> Existencias
          </button>

          <button 
            className={`pdm-tab-btn ${activeTab === 'precios' ? 'active' : ''}`}
            onClick={() => setActiveTab('precios')}
          >
            <History size={16} /> Auditoría
          </button>
        </div>

        {/* CUERPO */}
        <div className="pdm-body">
          {activeTab === "general" && (
            <div className="pdm-tab-content animate-fade-in">
              <div className="pdm-main-info">
                <div className="pdm-info-item">
                  <label><Layers size={14} /> Categoría</label>
                  <p>{category || "Sin categoría"}</p>
                </div>
                <div className="pdm-info-item">
                  <label><Tag size={14} /> Marca</label>
                  <p>{brand || "Sin marca"}</p>
                </div>
              </div>

              <div className="pdm-divider"></div>

              <div className="pdm-stats-grid">
                <div className="pdm-stat-card inventory">
                  <div className="pdm-stat-icon"><Hash size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>Existencia General</small>
                    <strong>{product.existencia_general} unidades</strong>
                  </div>
                </div>

                <div className="pdm-stat-card warning">
                  <div className="pdm-stat-icon"><AlertCircle size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>Stock Mínimo</small>
                    <strong>{product.stock_minimo_general} unidades</strong>
                  </div>
                </div>

                <div className="pdm-stat-card finance">
                  <div className="pdm-stat-icon"><DollarSign size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>Costo Unitario</small>
                    <strong>{formatCurrency(product.costo_unitario)}</strong>
                  </div>
                </div>

                <div className="pdm-stat-card finance">
                  <div className="pdm-stat-icon"><TrendingUp size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>Precio de Venta</small>
                    <strong>{formatCurrency(product.precio_venta)}</strong>
                  </div>
                </div>
              </div>

              <div className="pdm-profit-tag">
                <span>Margen de Ganancia Establecido:</span>
                <strong>{product.margen_ganancia}%</strong>
              </div>
            </div>
          )}

          {activeTab === "lotes" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListLots id_producto={product.id} />
            </div>
          )}

          {activeTab === "depositos" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListEdeposits id_producto={product.id} />
            </div>
          )}

          {activeTab === "precios" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListPrices productId={product.id} />
            </div>
          )}
        </div>

        {/* FOOTER ESTATICO CON VALIDACIÓN */}
        <div className="pdm-footer">
          <button 
            className={`pdm-btn-action delete ${hasHistory ? 'disabled' : ''}`} 
            onClick={!hasHistory ? onDelete : null}
            title={hasHistory ? "No se puede eliminar un producto con historial de movimientos" : "Eliminar este producto"}
            disabled={hasHistory}
          >
            {hasHistory ? <Lock size={16} /> : <Trash2 size={16} />}
            <span>{hasHistory ? "Eliminación Bloqueada" : "Eliminar Producto"}</span>
          </button>
          
          <div className="pdm-footer-right">
            <button className="pdm-btn-secondary" onClick={onClose}>Cerrar</button>
            <button className="pdm-btn-primary" onClick={onEdit}>
              <Pencil size={16} /> Editar Producto
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModalDetailed;