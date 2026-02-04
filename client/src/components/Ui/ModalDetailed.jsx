import React, { useState } from "react";
import { 
  Pencil, Trash2, X, Package, Tag, Layers, Hash, 
  TrendingUp, DollarSign, AlertCircle, Bookmark,
  History, Boxes
} from "lucide-react";
import ListLots from "../Products/ListLots"; 
import ListPrices from "../Products/ListPrices";
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

  if (!isOpen || !product) return null;

  const formatCurrency = (val) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(val);

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

        {/* NAVEGACIÓN DE PESTAÑAS ESTATICA */}
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
            className={`pdm-tab-btn ${activeTab === 'precios' ? 'active' : ''}`}
            onClick={() => setActiveTab('precios')}
          >
            <History size={16} /> Precios y Costos
          </button>
        </div>

        {/* CUERPO CON SCROLL */}
        <div className="pdm-body">
          
          {/* VISTA: GENERAL */}
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

          {/* VISTA: LOTES */}
          {activeTab === "lotes" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListLots id_producto={product.id} />
            </div>
          )}

          {/* VISTA: PRECIOS */}
          {activeTab === "precios" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListPrices productId={product.id} />
            </div>
          )}

        </div>

        {/* FOOTER ESTATICO */}
        <div className="pdm-footer">
          <button className="pdm-btn-action delete" onClick={onDelete}>
            <Trash2 size={16} /> <span>Eliminar Producto</span>
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