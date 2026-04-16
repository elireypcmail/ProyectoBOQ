import React, { useState } from "react";
import { 
  X, Package, Tag, Layers, Lock, 
  ImageIcon, AlertCircle, DollarSign, 
  TrendingUp, Percent 
} from "lucide-react";
import "../../../styles/ui/ModalDetailed.css";

const ProductModalDetail = ({
  isOpen,
  product,
  category,
  brand,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  if (!isOpen || !product) return null;

  // Formateador de moneda: usa dólares y coma para decimales
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "$0,00";
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const images = product.images || [];
  const currentImage = images.length > 0 ? images[selectedImgIdx] : null;
  const currentImageSrc = currentImage ? `data:${currentImage.mime_type};base64,${currentImage.data}` : null;

  return (
    <div className="pdm-overlay">
      <div className="pdm-container">
        
        {/* HEADER */}
        <div className="pdm-header">
          <div className="pdm-title-group">
            <div className="pdm-icon-main"><Package size={24} /></div>
            <div>
              <h3 className="pdm-title">{product.descripcion?.toUpperCase()}</h3>
              <span className="pdm-badge active">VISTA OPERADOR</span>
            </div>
          </div>
          <button className="pdm-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* TABS */}
        <div className="pdm-tabs">
          <button 
            className={`pdm-tab-btn ${activeTab === 'general' ? 'active' : ''}`} 
            onClick={() => setActiveTab('general')}
          >
            INFORMACIÓN
          </button>
        </div>

        {/* BODY */}
        <div className="pdm-body">
          {activeTab === "general" && (
            <div className="pdm-tab-content animate-fade-in">
              <div className="pdm-general-hero">
                <div className="pdm-image-section">
                    <div 
                      className={`pdm-image-container ${currentImage ? 'zoom-enabled' : ''}`}
                      onClick={() => currentImage && setIsZoomOpen(true)}
                    >
                      {currentImage ? (
                        <img src={currentImageSrc} alt={product.descripcion} className="pdm-image-view" />
                      ) : (
                        <div className="pdm-image-placeholder">
                          <ImageIcon size={48} strokeWidth={1.5} />
                          <span>SIN IMAGEN</span>
                        </div>
                      )}
                    </div>
                </div>

                <div className="pdm-main-info">
                  <div className="pdm-info-item">
                    <label><Layers size={14} /> CATEGORÍA</label>
                    <p>{(category || product.categoria || "N/A").toUpperCase()}</p>
                  </div>
                  <div className="pdm-info-item">
                    <label><Tag size={14} /> MARCA</label>
                    <p>{(brand || product.marca || "N/A").toUpperCase()}</p>
                  </div>
                  <div className="pdm-info-item">
                    <label><Lock size={14} /> SKU</label>
                    <p>{(product.sku || "N/A").toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="pdm-divider"></div>

              {/* Inventario Principal */}
              <div className="pdm-stat-card inventory" style={{ marginBottom: '1.5rem' }}>
                 <div className="pdm-stat-icon"><Package size={20} /></div>
                 <div className="pdm-stat-content">
                    <small>EXISTENCIA GENERAL ACTUALIZADA</small>
                    <strong style={{ fontSize: '1.2rem' }}>{product.existencia_general} UNIDADES</strong>
                 </div>
              </div>

              {/* Grid de Stats Médicos/Financieros */}
              <div className="pdm-stats-grid">
                <div className="pdm-stat-card warning">
                  <div className="pdm-stat-icon"><AlertCircle size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>STOCK MÍNIMO</small>
                    <strong>{product.stock_minimo_general} UNIDADES</strong>
                  </div>
                </div>
                
                <div className="pdm-stat-card finance">
                  <div className="pdm-stat-icon"><DollarSign size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>COSTO UNITARIO</small>
                    <strong>{formatCurrency(product.costo_unitario)}</strong>
                  </div>
                </div>

                <div className="pdm-stat-card finance">
                  <div className="pdm-stat-icon"><TrendingUp size={18} /></div>
                  <div className="pdm-stat-content">
                    <small>PRECIO DE VENTA</small>
                    <strong>{formatCurrency(product.precio_venta)}</strong>
                  </div>
                </div>
                
                <div className="pdm-stat-card finance">
                  <div className="pdm-stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}>
                    <Percent size={18} /> 
                  </div>
                  <div className="pdm-stat-content">
                    <small>MARGEN DE GANANCIA</small>
                    <strong>{product.margen_ganancia}%</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pdm-footer">
          <div style={{ color: '#666', fontSize: '0.85rem' }}>
            * Vista restringida para nivel Operativo (OPRI)
          </div>
          <div className="pdm-footer-right">
            <button className="pdm-btn-secondary" onClick={onClose}>CERRAR</button>
          </div>
        </div>
      </div>

      {/* ZOOM MODAL */}
      {isZoomOpen && (
        <div className="pdm-zoom-overlay" onClick={() => setIsZoomOpen(false)}>
          <button className="pdm-zoom-close"><X size={30} color="white" /></button>
          <img src={currentImageSrc} alt="Zoom" className="pdm-zoom-image" />
        </div>
      )}
    </div>
  );
};

export default ProductModalDetail;