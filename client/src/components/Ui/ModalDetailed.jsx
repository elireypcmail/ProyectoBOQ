import React, { useState, useEffect } from "react";
import { 
  Pencil, Trash2, X, Package, Tag, Layers, 
  TrendingUp, DollarSign, Bookmark, AlertCircle,
  History, Boxes, Warehouse, Lock, Image as ImageIcon // <--- Importamos ImageIcon
} from "lucide-react";
import { useProducts } from "../../context/ProductsContext";
import ListLots from "../Products/ListLots"; 
import ListPrices from "../Products/ListPrices";
import ListEdeposits from "../Products/ListEdeposits";
import "../../styles/ui/ModalDetailed.css";

const ModalDetailed = ({
  isOpen,
  product: initialProduct,
  category,
  brand,
  onClose,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const { getAuditProd, audits, getProductsById, products } = useProducts();

  const product = products.find(p => p.id === initialProduct?.id) || initialProduct;

  useEffect(() => {
    if (isOpen) setActiveTab("general");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && product?.id) getAuditProd(product.id);
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const auditList = Array.isArray(audits) ? audits : (audits?.data || []);
  const hasHistory = auditList.length > 0;

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleRefreshProduct = () => getProductsById(product.id);

  return (
    <div className="pdm-overlay">
      <div className="pdm-container">
        
        {/* HEADER */}
        <div className="pdm-header">
          <div className="pdm-title-group">
            <div className="pdm-icon-main"><Package size={24} /></div>
            <div>
              <h3 className="pdm-title">{product.descripcion}</h3>
              <span className={`pdm-badge ${product.estatus ? 'active' : 'inactive'}`}>
                {product.estatus ? "Activo en Catálogo" : "Producto Inactivo"}
              </span>
            </div>
          </div>
          <button className="pdm-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* TABS */}
        <div className="pdm-tabs">
          <button className={`pdm-tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <Bookmark size={16} /> General
          </button>
          <button className={`pdm-tab-btn ${activeTab === 'lotes' ? 'active' : ''}`} onClick={() => setActiveTab('lotes')}>
            <Boxes size={16} /> Lotes
          </button>
          <button className={`pdm-tab-btn ${activeTab === 'depositos' ? 'active' : ''}`} onClick={() => setActiveTab('depositos')}>
            <Warehouse size={16} /> Existencias
          </button>
          <button className={`pdm-tab-btn ${activeTab === 'precios' ? 'active' : ''}`} onClick={() => setActiveTab('precios')}>
            <History size={16} /> Auditoría
          </button>
        </div>

        {/* BODY */}
        <div className="pdm-body">
          {activeTab === "general" && (
            <div className="pdm-tab-content animate-fade-in">
              
              {/* --- NUEVA SECCIÓN SUPERIOR: IMAGEN + INFO --- */}
              <div className="pdm-general-hero">
                
                {/* Contenedor de la Imagen (Placeholder) */}
                <div className="pdm-image-container">
                  {/* Aquí pondrás tu lógica <img src={...} /> más tarde */}
                  <div className="pdm-image-placeholder">
                    <ImageIcon size={48} strokeWidth={1.5} />
                    <span>Sin imagen</span>
                  </div>
                </div>

                {/* Info básica movida aquí */}
                <div className="pdm-main-info">
                  <div className="pdm-info-item">
                    <label><Layers size={14} /> Categoría</label>
                    <p>{category || "Sin categoría"}</p>
                  </div>
                  <div className="pdm-info-item">
                    <label><Tag size={14} /> Marca</label>
                    <p>{brand || "Sin marca"}</p>
                  </div>
                  {/* Puedes agregar más info textual aquí si deseas */}
                </div>
              </div>

              <div className="pdm-divider"></div>

              {/* DASHBOARD DE EXISTENCIA RÁPIDA ACTUALIZADA */}
              <div className="pdm-stat-card inventory" style={{ marginBottom: '1.5rem', background: '#f0f9ff' }}>
                 <div className="pdm-stat-icon"><Package size={20} /></div>
                 <div className="pdm-stat-content">
                    <small>Existencia General Actualizada</small>
                    <strong style={{ fontSize: '1.2rem' }}>{product.existencia_general} unidades</strong>
                 </div>
              </div>

              <div className="pdm-stats-grid">
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
            </div>
          )}

          {activeTab === "lotes" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListLots 
                id_producto={product.id} 
                onRefreshProducts={handleRefreshProduct} 
              />
            </div>
          )}

          {activeTab === "depositos" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListEdeposits 
                id_producto={product.id} 
                existenciaGeneral={product.existencia_general}
                stockMinimoGeneral={product.stock_minimo_general}
                onRefreshProducts={handleRefreshProduct}
              />
            </div>
          )}

          {activeTab === "precios" && (
            <div className="pdm-tab-content animate-fade-in">
              <ListPrices productId={product.id} />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pdm-footer">
          <button 
            className={`pdm-btn-action delete ${hasHistory ? 'disabled' : ''}`} 
            onClick={!hasHistory ? onDelete : null}
            disabled={hasHistory}
            title={hasHistory ? "Protección: Producto con movimientos de auditoría" : "Eliminar"}
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